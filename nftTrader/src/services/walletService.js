import { supabase } from '../lib/supabaseClient.js';

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
}

export const STARTING_BALANCE_EUR = 300;

export async function getCurrentUserOrThrow() {
  assertSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message || 'Failed to resolve current user');
  if (!user) throw new Error('You must be signed in');
  return user;
}

export async function ensureWalletForCurrentUser() {
  assertSupabase();
  const user = await getCurrentUserOrThrow();
  const { data: existing, error: selectErr } = await supabase
    .from('wallets')
    .select('user_id, balance_eur')
    .eq('user_id', user.id)
    .maybeSingle();
  if (selectErr) throw new Error(selectErr.message || 'Failed to fetch wallet');
  if (existing) return existing;
  const { data, error } = await supabase
    .from('wallets')
    .insert([{ user_id: user.id, balance_eur: STARTING_BALANCE_EUR }])
    .select('user_id, balance_eur')
    .single();
  if (error) throw new Error(error.message || 'Failed to create wallet');
  return data;
}

export async function getMyWalletBalance() {
  assertSupabase();
  const user = await getCurrentUserOrThrow();
  const { data, error } = await supabase
    .from('wallets')
    .select('balance_eur')
    .eq('user_id', user.id)
    .single();
  if (error) throw new Error(error.message || 'Failed to load wallet');
  return Number(data.balance_eur);
}

export async function debitMyWallet(amountEur) {
  assertSupabase();
  const user = await getCurrentUserOrThrow();
  const amount = Number(amountEur);
  if (!(amount > 0)) throw new Error('Debit amount must be positive');
  const { data: current, error: loadErr } = await supabase
    .from('wallets')
    .select('balance_eur')
    .eq('user_id', user.id)
    .single();
  if (loadErr) throw new Error(loadErr.message || 'Failed to load wallet');
  const newBalance = Number(current.balance_eur) - amount;
  if (newBalance < 0) throw new Error('Insufficient funds');
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance_eur: newBalance })
    .eq('user_id', user.id)
    .select('balance_eur')
    .single();
  if (error) throw new Error(error.message || 'Failed to debit wallet');
  return Number(data.balance_eur);
}

export async function creditMyWallet(amountEur) {
  assertSupabase();
  const user = await getCurrentUserOrThrow();
  const amount = Number(amountEur);
  if (!(amount > 0)) throw new Error('Credit amount must be positive');
  const { data: current, error: loadErr } = await supabase
    .from('wallets')
    .select('balance_eur')
    .eq('user_id', user.id)
    .single();
  if (loadErr) throw new Error(loadErr.message || 'Failed to load wallet');
  const newBalance = Number(current.balance_eur) + amount;
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance_eur: newBalance })
    .eq('user_id', user.id)
    .select('balance_eur')
    .single();
  if (error) throw new Error(error.message || 'Failed to credit wallet');
  return Number(data.balance_eur);
}


