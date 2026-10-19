'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')

  const account_id = formData.get('account_id') as string
  const category_id = formData.get('category_id') as string
  const type = formData.get('type') as 'income' | 'expense'
  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

  // 1. Fetch current account balance
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', account_id)
    .single()

  if (accError || !account) throw new Error('Account not found')

  // 2. Insert the transaction
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: user.id,
    account_id,
    category_id: category_id || null,
    type,
    amount,
    description,
    date,
  })

  if (txError) throw new Error(txError.message)

  // 3. Calculate new balance
  const currentBalance = Number(account.balance)
  const newBalance = type === 'income' ? currentBalance + amount : currentBalance - amount

  // 4. Update the account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', account_id)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Unauthorized')

  const transaction_id = formData.get('transaction_id') as string
  const account_id = formData.get('account_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as 'income' | 'expense'

  // 1. Fetch current account balance
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', account_id)
    .single()

  if (accError || !account) throw new Error('Account not found')

  // 2. Reverse the math 
  // If we are deleting an expense, we ADD the money back. 
  // If we are deleting an income, we SUBTRACT the money.
  const currentBalance = Number(account.balance)
  const newBalance = type === 'expense' ? currentBalance + amount : currentBalance - amount

  // 3. Update the account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', account_id)

  if (updateError) throw new Error(updateError.message)

  // 4. Delete the transaction record
  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transaction_id)
    .eq('user_id', user.id) // Extra security measure

  if (deleteError) throw new Error(deleteError.message)

  // Refresh both pages so the UI updates instantly
  revalidatePath('/transactions')
  revalidatePath('/')
}