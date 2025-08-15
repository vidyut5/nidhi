"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const customers = Array.from({ length: 10 }, (_, i) => ({
  id: `CUST-${1000 + i}`,
  name: ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Neha Gupta'][i % 4],
  company: ['TechFlow', 'LuminTech', 'MeterPro', 'SmartGrid'][i % 4],
  orders: [12, 5, 9, 3][i % 4],
  value: [125000, 54000, 89000, 32000][i % 4],
}))

export default function SellerCustomersPage() {
  // Placeholder hook wiring for loading/error/empty states
  const isLoading = false
  const error: Error | null = null
  const data = customers

  if (isLoading) {
    return <div className="py-6" role="status" aria-live="polite">Loading customers...</div>
  }
  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('SellerCustomersPage error:', error)
    }
    return <div className="py-6 text-red-600" role="alert">An unexpected error occurred. Please try again later.</div>
  }
  if (!data || data.length === 0) {
    return (
      <div className="py-6 text-center">
        <h1 className="text-2xl font-bold mb-2">No customers yet</h1>
        <p className="text-muted-foreground mb-4">Invite your first customer to get started.</p>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Invite Customer</Button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Your B2B buyers and activity</p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">Invite Customer</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Customer</TableHead>
                <TableHead className="px-4 py-3">Company</TableHead>
                <TableHead className="px-4 py-3">Orders</TableHead>
                <TableHead className="px-4 py-3">Total Value</TableHead>
                <TableHead className="px-4 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground">{c.id}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3">{c.company}</TableCell>
                  <TableCell className="px-4 py-3">{c.orders}</TableCell>
                  <TableCell className="px-4 py-3">₹{c.value.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}



