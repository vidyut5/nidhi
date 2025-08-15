import { AdminPortalHeader } from './portal-header'
import { AdminPortalSidebar } from './portal-sidebar'

export function AdminPortalChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <AdminPortalHeader />
      <div className="container-wide py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <AdminPortalSidebar />
        <main>{children}</main>
      </div>
    </div>
  )
}


