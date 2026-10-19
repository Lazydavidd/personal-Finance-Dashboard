'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Define the shape of the data we expect from Supabase
type Transaction = {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
}

export function CashFlowChart({ transactions }: { transactions: Transaction[] | null }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
        No transaction data available yet.
      </div>
    )
  }

  // Group transactions by date and sum the amounts
  const dataMap: Record<string, { date: string; income: number; expense: number }> = {}

  transactions.forEach((tx) => {
    // Format date from YYYY-MM-DD to a shorter format like MM-DD
    const shortDate = tx.date.slice(5) 
    
    if (!dataMap[shortDate]) {
      dataMap[shortDate] = { date: shortDate, income: 0, expense: 0 }
    }

    if (tx.type === 'income') {
      dataMap[shortDate].income += Number(tx.amount)
    } else {
      dataMap[shortDate].expense += Number(tx.amount)
    }
  })

  // Convert the map to an array and reverse it so chronological order goes left-to-right
  const chartData = Object.values(dataMap).reverse()

  const formatRupiah = (value: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#9ca3af' }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickFormatter={(value) => `Rp ${value / 1000}k`}
        />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          formatter={(value: number) => formatRupiah(value)}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" fill="#fb923c" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}