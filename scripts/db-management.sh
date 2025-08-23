#!/bin/bash

# =================================================================
# VIDYUT DATABASE MANAGEMENT SCRIPTS
# Production database migration and backup utilities
# =================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="vidyut_prod"
BACKUP_DIR="./backups"
MIGRATION_DIR="./prisma/migrations"
CURRENT_DATE=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# =================================================================
# HELPER FUNCTIONS
# =================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if PostgreSQL is available
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client (psql) is not installed"
        exit 1
    fi
    
    # Check if Prisma CLI is available
    if ! command -v prisma &> /dev/null; then
        log_error "Prisma CLI is not installed. Run: npm install -g prisma"
        exit 1
    fi
    
    # Check environment variables
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# =================================================================
# DATABASE BACKUP FUNCTIONS
# =================================================================

backup_database() {
    log_info "Creating database backup..."
    
    local backup_file="$BACKUP_DIR/${DB_NAME}_backup_${CURRENT_DATE}.sql"
    
    # Create compressed backup
    pg_dump $DATABASE_URL | gzip > "${backup_file}.gz"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup created: ${backup_file}.gz"
        
        # Create a simple backup (uncompressed) for quick access
        pg_dump $DATABASE_URL > $backup_file
        log_success "Uncompressed backup created: $backup_file"
        
        # Clean up old backups (keep last 30 days)
        find $BACKUP_DIR -name "${DB_NAME}_backup_*.sql*" -type f -mtime +30 -delete
        
        return 0
    else
        log_error "Database backup failed"
        return 1
    fi
}

restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "Please specify backup file to restore"
        log_info "Usage: $0 restore <backup_file>"
        log_info "Available backups:"
        ls -la $BACKUP_DIR/*.sql* 2>/dev/null || log_info "No backups found"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_warning "This will overwrite the current database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        return 0
    fi
    
    log_info "Restoring database from: $backup_file"
    
    # Drop existing database and recreate
    dropdb --if-exists $DB_NAME
    createdb $DB_NAME
    
    # Restore from backup
    if [[ $backup_file == *.gz ]]; then
        gunzip -c $backup_file | psql $DATABASE_URL
    else
        psql $DATABASE_URL < $backup_file
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Database restored successfully"
        return 0
    else
        log_error "Database restore failed"
        return 1
    fi
}

# =================================================================
# MIGRATION FUNCTIONS
# =================================================================

run_migrations() {
    log_info "Running database migrations..."
    
    # Create backup before migration
    backup_database
    
    # Generate Prisma client
    prisma generate
    
    # Run migrations
    prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        log_success "Migrations completed successfully"
        return 0
    else
        log_error "Migration failed"
        log_warning "You may need to restore from backup"
        return 1
    fi
}

reset_database() {
    log_warning "This will completely reset the database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Reset cancelled"
        return 0
    fi
    
    log_info "Resetting database..."
    
    # Create backup before reset
    backup_database
    
    # Reset database
    prisma migrate reset --force
    
    if [ $? -eq 0 ]; then
        log_success "Database reset completed"
        return 0
    else
        log_error "Database reset failed"
        return 1
    fi
}

create_migration() {
    local migration_name=$1
    
    if [ -z "$migration_name" ]; then
        log_error "Please specify migration name"
        log_info "Usage: $0 create-migration <migration_name>"
        return 1
    fi
    
    log_info "Creating new migration: $migration_name"
    
    prisma migrate dev --name "$migration_name"
    
    if [ $? -eq 0 ]; then
        log_success "Migration created successfully"
        return 0
    else
        log_error "Migration creation failed"
        return 1
    fi
}

# =================================================================
# DATABASE HEALTH CHECK
# =================================================================

health_check() {
    log_info "Performing database health check..."
    
    # Check connection
    if psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection: OK"
    else
        log_error "Database connection: FAILED"
        return 1
    fi
    
    # Check table count
    local table_count=$(psql $DATABASE_URL -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
    log_info "Tables in database: $table_count"
    
    # Check if critical tables exist
    local critical_tables=("users" "products" "orders" "categories")
    for table in "${critical_tables[@]}"; do
        if psql $DATABASE_URL -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
            log_success "Table '$table': OK"
        else
            log_warning "Table '$table': Missing or empty"
        fi
    done
    
    # Check database size
    local db_size=$(psql $DATABASE_URL -t -c "SELECT pg_size_pretty(pg_database_size(current_database()));")
    log_info "Database size: $db_size"
    
    # Check for long-running queries
    local long_queries=$(psql $DATABASE_URL -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';")
    if [ "$long_queries" -gt 0 ]; then
        log_warning "Long-running queries detected: $long_queries"
    else
        log_success "No long-running queries"
    fi
    
    return 0
}

# =================================================================
# PERFORMANCE OPTIMIZATION
# =================================================================

optimize_database() {
    log_info "Optimizing database performance..."
    
    # Update table statistics
    psql $DATABASE_URL -c "ANALYZE;"
    log_success "Table statistics updated"
    
    # Vacuum tables
    psql $DATABASE_URL -c "VACUUM;"
    log_success "Tables vacuumed"
    
    # Reindex tables
    psql $DATABASE_URL -c "REINDEX DATABASE $DB_NAME;"
    log_success "Tables reindexed"
    
    log_success "Database optimization completed"
}

# =================================================================
# MAIN SCRIPT LOGIC
# =================================================================

show_usage() {
    echo "Vidyut Database Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  backup                     Create database backup"
    echo "  restore <backup_file>      Restore database from backup"
    echo "  migrate                    Run database migrations"
    echo "  reset                      Reset database (WARNING: destructive)"
    echo "  create-migration <name>    Create new migration"
    echo "  health                     Perform database health check"
    echo "  optimize                   Optimize database performance"
    echo "  help                       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore ./backups/vidyut_prod_backup_20240101_120000.sql"
    echo "  $0 migrate"
    echo "  $0 create-migration add_user_preferences"
    echo "  $0 health"
}

# Main execution
case "$1" in
    backup)
        check_prerequisites
        backup_database
        ;;
    restore)
        check_prerequisites
        restore_database "$2"
        ;;
    migrate)
        check_prerequisites
        run_migrations
        ;;
    reset)
        check_prerequisites
        reset_database
        ;;
    create-migration)
        check_prerequisites
        create_migration "$2"
        ;;
    health)
        check_prerequisites
        health_check
        ;;
    optimize)
        check_prerequisites
        optimize_database
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

exit $?