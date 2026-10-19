import { createClient } from '@/utils/supabase/server'
import { TransactionForm } from '../components/TransactionForm'
import { DeleteTransactionButton } from '../components/DeleteTransactionButton'

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryFilter = params.category

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <a href="/login" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Go to Login</a>
      </main>
    )
  }

  // Fetch all transactions, optionally filtering by category
  let query = supabase
    .from('transactions')
    .select('*, categories(name)')
    .order('date', { ascending: false })

  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter)
  }

  const { data: transactions } = await query
  const { data: categories } = await supabase.from('categories').select('id, name')

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-gray-900 font-sans p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header with Navigation */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transactions Manager</h1>
            <p className="text-sm text-gray-500">Record and review your income and expenses.</p>
          </div>
          <a href="/" className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold hover:bg-gray-50 transition">
            &larr; Back to Dashboard
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Transaction Form */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <TransactionForm />
             </div>
          </div>

          {/* Right Column: Transactions Table & Filters */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-600">Filter by Category:</span>
              <form className="flex gap-2">
                 <select name="category" defaultValue={categoryFilter || ""} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 transition">
                   <option value="">All Categories</option>
                   {categories?.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                   ))}
                 </select>
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Filter</button>
                 {categoryFilter && (
                   <a href="/transactions" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition">Clear</a>
                 )}
              </form>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Date</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 rounded-r-lg"></th> {/* New column for the delete button */}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-4 py-4 text-gray-500">{tx.date}</td>
                          <td className="px-4 py-4 font-medium text-gray-900">{tx.description || 'General Item'}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                              {tx.categories?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-gray-900'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatRupiah(Number(tx.amount))}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {/* The Delete Button Component */}
                            <DeleteTransactionButton 
                              transactionId={tx.id} 
                              accountId={tx.account_id} 
                              amount={Number(tx.amount)} 
                              type={tx.type} 
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}