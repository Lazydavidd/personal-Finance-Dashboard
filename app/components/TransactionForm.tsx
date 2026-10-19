import { createClient } from '@/utils/supabase/server'
import { addTransaction } from '../actions/transactions'

export async function TransactionForm() {
  const supabase = await createClient()

  // Fetch accounts and categories for dropdown selections
  const { data: accounts } = await supabase.from('accounts').select('id, name')
  const { data: categories } = await supabase.from('categories').select('id, name, type')

  if (!accounts || accounts.length === 0) {
    return (
      <div className="p-4 bg-slate-800 rounded text-sm text-slate-400">
        Please add an account above before logging transactions.
      </div>
    )
  }

  return (
    <form action={addTransaction} className="bg-slate-800 p-5 rounded-lg border border-slate-700 space-y-4 max-w-xl">
      <h3 className="text-md font-semibold text-white">Log New Transaction</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Type</label>
          <select name="type" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Account</label>
          <select name="account_id" required className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Category</label>
          <select name="category_id" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white">
            <option value="">Uncategorized</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Amount (Rp)</label>
          <input
            name="amount"
            type="number"
            step="1000"
            placeholder="e.g. 50000"
            required
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Description</label>
        <input
          name="description"
          placeholder="e.g. Weekly grocery shopping"
          className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm text-white"
        />
      </div>

      <button type="submit" className="w-full bg-green-600 hover:bg-green-500 py-2 rounded font-medium text-sm text-white transition">
        Record Transaction
      </button>
    </form>
  )
}