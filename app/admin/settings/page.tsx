import { readAdminSettings, writeAdminSettings } from '@/lib/settings-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminSettingsPage() {
  const s = await readAdminSettings()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>
      <form action={save} className="grid gap-3 max-w-xl">
        <input name="siteName" defaultValue={s.siteName} className="border rounded px-3 py-2" placeholder="Site name" />
        <input name="supportEmail" defaultValue={s.supportEmail} className="border rounded px-3 py-2" placeholder="Support email" />
        <div className="grid grid-cols-2 gap-3">
          <input name="currency" defaultValue={s.currency} className="border rounded px-3 py-2" placeholder="Currency" />
          <input name="locale" defaultValue={s.locale} className="border rounded px-3 py-2" placeholder="Locale" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="maintenanceMode" defaultChecked={s.maintenanceMode} /> Maintenance mode</label>
        <Button type="submit" className="w-fit">Save</Button>
      </form>
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Last updated: {new Date(s.updatedAt).toLocaleString()}</CardContent>
      </Card>
    </div>
  )
}

async function save(formData: FormData) {
  'use server'
  const siteName = String(formData.get('siteName') || 'Vidyut')
  const supportEmail = String(formData.get('supportEmail') || 'support@example.com')
  const currency = String(formData.get('currency') || 'INR')
  const locale = String(formData.get('locale') || 'en-IN')
  const maintenanceMode = formData.get('maintenanceMode') === 'on'
  await writeAdminSettings({ siteName, supportEmail, currency, locale, maintenanceMode, updatedAt: new Date().toISOString() })
}


