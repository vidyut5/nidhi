"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type SellerOption = { id: string; name: string | null; email: string; sellerProfile?: { isEnterprise: boolean | null } | null }
type CategoryOption = { id: string; name: string }

export function AdminProductsFilters({ sellers, categories }: { sellers: SellerOption[]; categories: CategoryOption[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [isActive, setIsActive] = useState(searchParams.get('isActive') ?? 'all')
  const [uploaderId, setUploaderId] = useState(searchParams.get('uploaderId') ?? 'all')
  const [accountType, setAccountType] = useState(searchParams.get('accountType') ?? 'all')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? 'all')
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') ?? '')

  const push = useCallback((overrides?: Record<string, string | undefined>) => {
    const p = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value?: string) => {
      if (value == null || value === '') p.delete(key)
      else p.set(key, value)
    }
    setOrDelete('q', overrides?.q ?? q)
    const vIsActive = overrides?.isActive ?? isActive
    const vUploader = overrides?.uploaderId ?? uploaderId
    const vAccount = overrides?.accountType ?? accountType
    const vCategory = overrides?.categoryId ?? categoryId
    setOrDelete('isActive', vIsActive === 'all' ? '' : vIsActive)
    setOrDelete('uploaderId', vUploader === 'all' ? '' : vUploader)
    setOrDelete('accountType', vAccount === 'all' ? '' : vAccount)
    setOrDelete('categoryId', vCategory === 'all' ? '' : vCategory)
    setOrDelete('dateFrom', overrides?.dateFrom ?? dateFrom)
    setOrDelete('dateTo', overrides?.dateTo ?? dateTo)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }, [router, pathname, searchParams, q, isActive, uploaderId, accountType, categoryId, dateFrom, dateTo])

  const sellerOptions = useMemo(() => sellers.map(s => ({
    id: s.id,
    label: s.name ?? s.email,
    accountType: s.sellerProfile?.isEnterprise ? 'Enterprise' : 'Individual',
  })), [sellers])

  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-full md:w-auto md:min-w-[280px]">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, SKU, brand, tags..." onKeyDown={e => { if (e.key === 'Enter') push({ q }) }} />
      </div>

      <Select value={isActive} onValueChange={v => { setIsActive(v); push({ isActive: v }) }}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={v => { setCategoryId(v); push({ categoryId: v }) }}>
        <SelectTrigger className="w-[220px]"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={uploaderId} onValueChange={v => { setUploaderId(v); push({ uploaderId: v }) }}>
        <SelectTrigger className="w-[240px]"><SelectValue placeholder="Uploader" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Uploaders</SelectItem>
          {sellerOptions.map(s => (
            <SelectItem key={s.id} value={s.id}>{s.label} · {s.accountType}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={accountType} onValueChange={v => { setAccountType(v); push({ accountType: v }) }}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Account Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Date range</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <div className="text-sm font-medium">Created between</div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => { setDateFrom(''); setDateTo(''); push({ dateFrom: '', dateTo: '' }) }}>Clear</Button>
              <Button size="sm" onClick={() => push({ dateFrom, dateTo })}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={() => push({ q })}>Search</Button>
    </div>
  )
}


