import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { ensureWalletForCurrentUser, getMyWalletBalance } from '../services/walletService.js';

const WalletContext = createContext({
  balance: null,
  loading: false,
  error: '',
  refreshBalance: async () => {},
});

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadBalance() {
    setError('');
    try {
      setLoading(true);
      if (!supabase) {
        setBalance(null);
        setError('');
        return;
      }
      await ensureWalletForCurrentUser();
      const b = await getMyWalletBalance();
      setBalance(Number(b));
    } catch (e) {
      setBalance(null);
      const msg = e?.message || '';
      // If not signed in, don't surface an error in UI
      if (msg.toLowerCase().includes('signed in')) {
        setError('');
      } else {
        setError(msg || 'Failed to load wallet');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const sub = supabase?.auth?.onAuthStateChange?.(() => {
      loadBalance().catch(() => {});
    });
    // initial
    loadBalance().catch(() => {});
    return () => {
      if (sub && typeof sub.subscription?.unsubscribe === 'function') {
        sub.subscription.unsubscribe();
      }
    };
  }, []);

  const value = useMemo(() => ({
    balance,
    loading,
    error,
    refreshBalance: loadBalance,
  }), [balance, loading, error]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}


