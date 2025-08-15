import { ReactNode } from 'react'
import { AdminPortalChrome } from '@/components/admin/portal-chrome'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminPortalChrome>
      {children}
    </AdminPortalChrome>
  )
}


