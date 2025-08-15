import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AdminProductsFilters } from '../../../components/admin/products-filters'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

function parseString(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0]
  return param ?? undefined
}

function parseBoolean(param: string | string[] | undefined): boolean | undefined {
  const v = parseString(param)
  if (v == null || v === '') return undefined
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

function parseIntOrUndefined(param: string | string[] | undefined, fallback?: number): number | undefined {
  const v = parseString(param)
  if (v == null || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const q = parseString(sp.q)
  const uploaderId = parseString(sp.uploaderId)
  const accountType = parseString(sp.accountType) // 'individual' | 'enterprise'
  const isActive = parseBoolean(sp.isActive)
  const categoryId = parseString(sp.categoryId)
  const dateFrom = parseString(sp.dateFrom)
  const dateTo = parseString(sp.dateTo)
  const page = parseIntOrUndefined(sp.page, 1) || 1
  const limit = Math.min(parseIntOrUndefined(sp.limit, 20) || 20, 100)
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {}
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
      { tags: { contains: q } },
      { brand: { contains: q } },
      { model: { contains: q } },
    ]
  }
  if (typeof isActive === 'boolean') where.isActive = isActive
  if (categoryId) where.categoryId = categoryId
  if (uploaderId) where.sellerId = uploaderId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      const from = new Date(dateFrom)
      if (!Number.isNaN(from.getTime())) where.createdAt.gte = from
    }
    if (dateTo) {
      const to = new Date(dateTo)
      if (!Number.isNaN(to.getTime())) {
        // Include the whole end day
        to.setHours(23, 59, 59, 999)
        where.createdAt.lte = to
      }
    }
  }
  if (accountType === 'enterprise' || accountType === 'individual') {
    const textSearchOr = Array.isArray(where.OR) ? where.OR : []
    const accountClauses: Prisma.ProductWhereInput[] = accountType === 'enterprise'
      ? [{ seller: { sellerProfile: { is: { isEnterprise: true } } } }]
      : [
          { seller: { sellerProfile: { is: { isEnterprise: false } } } },
          { seller: { sellerProfile: { is: null } } },
        ]
    const existingAnd = Array.isArray(where.AND) ? where.AND : []
    // Enforce (textSearch OR ...) AND (accountType OR ...)
    where.OR = accountClauses
    where.AND = [
      ...existingAnd,
      ...(textSearchOr.length ? [{ OR: textSearchOr }] : []),
      { OR: accountClauses },
    ]
  }

  const [products, totalCount, sellers, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        isActive: true,
        createdAt: true,
        salesCount: true,
        category: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true, email: true, sellerProfile: { select: { isEnterprise: true } } } },
      },
    }),
    prisma.product.count({ where }),
    prisma.user.findMany({
      where: { products: { some: {} } },
      orderBy: { name: 'asc' },
      take: 100,
      select: { id: true, name: true, email: true, sellerProfile: { select: { isEnterprise: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  // Build query string for export link
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (uploaderId) params.set('uploaderId', uploaderId)
  if (accountType) params.set('accountType', accountType)
  if (typeof isActive === 'boolean') params.set('isActive', String(isActive))
  if (categoryId) params.set('categoryId', categoryId)
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href={`/admin/products/export?${params.toString()}`} prefetch={false}>
          <Button size="sm" variant="outline">Export CSV</Button>
        </Link>
      </div>

      <AdminProductsFilters
        sellers={sellers}
        categories={categories}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-sm text-muted-foreground">No products found for current filters.</TableCell>
              </TableRow>
            )}
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell className="max-w-[320px] truncate" title={p.name}>{p.name}</TableCell>
                <TableCell>{p.sku ?? '—'}</TableCell>
                <TableCell>{p.category?.name ?? '—'}</TableCell>
                <TableCell>{p.seller.name ?? p.seller.email}</TableCell>
                <TableCell>{p.seller.sellerProfile?.isEnterprise ? 'Enterprise' : 'Individual'}</TableCell>
                <TableCell>{p.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>₹{p.price.toLocaleString('en-IN')}</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{p.salesCount ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(skip + 1).toLocaleString()} - {Math.min(skip + limit, totalCount).toLocaleString()} of {totalCount.toLocaleString()}
        </div>
      <div className="flex items-center gap-2">
          <Link href={{ pathname: '/admin/products', query: { ...Object.fromEntries(params.entries()), page: Math.max(1, page - 1) } }} prefetch={false}>
            <Button size="sm" variant="outline" disabled={page <= 1}>Previous</Button>
          </Link>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <Link href={{ pathname: '/admin/products', query: { ...Object.fromEntries(params.entries()), page: Math.min(totalPages, page + 1) } }} prefetch={false}>
            <Button size="sm" variant="outline" disabled={page >= totalPages}>Next</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


