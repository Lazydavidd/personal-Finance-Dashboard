'use client'

import { useActionState } from 'react'
import { deleteTransaction } from '../actions/transactions'

export function DeleteTransactionButton({ 
  transactionId, 
  accountId, 
  amount, 
  type 
}: { 
  transactionId: string; 
  accountId: string; 
  amount: number; 
  type: string;
}) {
  return (
    <form action={deleteTransaction} onSubmit={(e) => {
      if (!confirm('Are you sure you want to delete this transaction? Your account balance will be recalculated.')) {
        e.preventDefault()
      }
    }}>
      <input type="hidden" name="transaction_id" value={transactionId} />
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="type" value={type} />
      
      <button 
        type="submit" 
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        title="Delete Transaction"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </form>
  )
}