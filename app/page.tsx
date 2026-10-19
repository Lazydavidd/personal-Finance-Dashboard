import { createClient } from '@/utils/supabase/server'
import { addAccount } from './actions/accounts'
import { TransactionForm } from './components/TransactionForm'

// Rupiah Formatter
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Minimal SVG Icons
const Icons = {
  Dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
  Transaction: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>,
  Card: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>,
  Bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
}

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <p className="mb-4 text-lg">Please log in to view your dashboard.</p>
          <a href="/login" className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Go to Login</a>
        </div>
      </main>
    )
  }

  // Generate a friendly display name
  const displayName = user.email?.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'User'
  const capitalizedName = displayName.replace(/\b\w/g, c => c.toUpperCase())

  // Get the current month in YYYY-MM-01 format (matching the view's date_trunc output)
  const today = new Date()
  const currentMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

  // Execute queries in parallel for performance
  const [
    { data: accounts },
    { data: transactions },
    { data: summaryData } // Fetch from the new view
  ] = await Promise.all([
    supabase.from('accounts').select('*').order('created_at', { ascending: false }),
    supabase.from('transactions').select('*, categories(name)').order('date', { ascending: false }).limit(6),
    supabase.from('monthly_summary').select('*').eq('month_start', currentMonthStart).single()
  ])

  // Extract calculations
  const netWorth = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
  
  // Use the pre-calculated view data (fallback to 0 if the view is empty for this month)
  const totalIncome = summaryData?.total_income || 0
  const totalExpenses = summaryData?.total_expense || 0

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 font-sans overflow-hidden">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-64 bg-[#0B0F19] text-gray-400 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-8 flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">D</div>
            <span className="text-xl font-bold tracking-wide">Finances</span>
          </div>

          <nav className="px-4 space-y-2">
            <p className="px-4 text-xs font-semibold tracking-widest text-gray-600 mb-4 mt-4">MENU</p>
            <a href="/" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl transition">
              {Icons.Dashboard} Dashboard
            </a>
            {/* Link updated to point to the new Transactions page */}
            <a href="/transactions" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 hover:text-white rounded-xl transition">
              {Icons.Transaction} Transactions
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 hover:text-white rounded-xl transition">
              {Icons.Card} Cards
            </a>
          </nav>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 blur-2xl rounded-full"></div>
            <h4 className="text-white font-semibold mb-1 relative">Switch to Pro</h4>
            <p className="text-xs text-gray-400 relative mb-3">Unlock advanced analytics and priority support.</p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition">Upgrade Now</button>
          </div>
          <button className="mt-6 flex items-center gap-3 px-4 text-sm hover:text-white transition">
            Log out
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {capitalizedName} 👋</h1>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <input 
                type="text" 
                placeholder="Search anything... (Cmd+K)" 
                className="w-64 bg-gray-100 text-sm rounded-full pl-4 pr-10 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="text-gray-400 hover:text-gray-600">{Icons.Bell}</button>
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt="Avatar" />
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-purple-500">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Net Worth</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatRupiah(netWorth)}</h2>
              <p className="text-xs text-green-500 mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">Live Balance</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-orange-400">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Spending</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatRupiah(Number(totalExpenses))}</h2>
              <p className="text-xs text-red-500 mt-2 bg-red-50 inline-block px-2 py-1 rounded-md">This Month</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-blue-400">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Income</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatRupiah(Number(totalIncome))}</h2>
              <p className="text-xs text-green-500 mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">This Month</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-green-400">
              <p className="text-sm text-gray-500 font-medium mb-1">Total Transactions</p>
              <h2 className="text-2xl font-bold text-gray-900">{transactions?.length || 0}</h2>
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 inline-block px-2 py-1 rounded-md">Recorded</p>
            </div>
          </div>

          {/* MIDDLE SECTION: Charts & Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Mockup (Takes 2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Cash Flow Activity</h3>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Income</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Expense</span>
                </div>
              </div>
              {/* CSS-based visual placeholder for a chart */}
              <div className="relative w-full h-48 border-b border-l border-gray-100 flex items-end justify-between px-2 pb-2">
                {[40, 70, 45, 90, 60, 100, 80].map((height, i) => (
                  <div key={i} className="flex gap-1 items-end h-full">
                    <div className="w-4 bg-green-400/80 rounded-t-sm hover:bg-green-500 transition-all" style={{ height: `${height}%` }}></div>
                    <div className="w-4 bg-orange-400/80 rounded-t-sm hover:bg-orange-500 transition-all" style={{ height: `${height * 0.6}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Cards Mockup (Takes 1/3 width) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">My Wallets</h3>
              </div>
              {/* Virtual Card */}
              <div className="w-full h-48 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="font-bold text-lg tracking-widest italic">Primary</span>
                  <svg className="w-8 h-8 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-slate-300 mb-1">Total Balance</p>
                  <p className="text-2xl font-mono tracking-wider">{formatRupiah(netWorth)}</p>
                </div>
              </div>
              <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-500 transition">
                + Add new wallet
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: Transactions & Quick Add */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
            
            {/* Latest Transactions Table (Takes 2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Latest Transactions</h3>
                <a href="/transactions" className="text-sm text-blue-600 font-semibold hover:underline">See All</a>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Title</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-4 py-4 font-medium text-gray-900">{tx.description || 'General Item'}</td>
                          <td className="px-4 py-4 text-gray-500">{tx.date}</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                              {tx.categories?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-gray-900'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatRupiah(Number(tx.amount))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-400">
                          No transactions yet. Add one below!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Add Form (Takes 1/3 width) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Quick Add</h3>
              <form action={addAccount} className="space-y-4">
                 <div>
                  <label className="text-xs font-semibold text-gray-500">Account Name</label>
                  <input name="name" placeholder="e.g. Bank Mandiri, GoPay" required className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                    <label className="text-xs font-semibold text-gray-500">Type</label>
                    <select name="type" className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition">
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="cash">Cash / Wallet</option>
                    </select>
                   </div>
                   <div>
                    <label className="text-xs font-semibold text-gray-500">Balance</label>
                    <input name="balance" type="number" placeholder="Rp" required className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition" />
                   </div>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition mt-2">
                   Add Wallet
                 </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Or log an expense:</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-500 italic">
                  "Use the full <a href="/transactions" className="text-blue-600 hover:underline">Transactions</a> page to log items."
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}