"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type SalesPoint = { month: string; sales: number; orders: number }
type CategoryPoint = { name: string; value: number; count: number }

export function SalesChart({ data, formatPrice }: { data: SalesPoint[]; formatPrice: (n: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'sales' ? formatPrice(value) : value,
            name === 'sales' ? 'Sales' : 'Orders',
          ]}
        />
        <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CategoryPie({ data, colors }: { data: CategoryPoint[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => {
            const safeColor = colors && colors.length > 0 ? colors[index % colors.length] : '#cccccc'
            return <Cell key={`cell-${index}`} fill={safeColor} />
          })}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
      </PieChart>
    </ResponsiveContainer>
  )
}



