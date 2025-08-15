-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN "kycDocs" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "tier" TEXT NOT NULL DEFAULT 'Bronze',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "totalSales" REAL NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kycDocs" TEXT
);
INSERT INTO "new_User" ("avatar", "bio", "createdAt", "email", "id", "isVerified", "location", "name", "password", "phone", "rating", "role", "tier", "totalOrders", "totalSales", "updatedAt") SELECT "avatar", "bio", "createdAt", "email", "id", "isVerified", "location", "name", "password", "phone", "rating", "role", "tier", "totalOrders", "totalSales", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
