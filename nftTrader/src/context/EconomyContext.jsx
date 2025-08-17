import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { RandomWalkStrategy } from '../lib/economyStrategies.js';
import { computePrice as computePriceUtil } from '../lib/pricing.js';

const MAX_HISTORY_POINTS = 60; // last 60 ticks

const EconomyContext = createContext({
  getPercentage: () => 0,
  ensureTracked: () => {},
  computePrice: () => 0,
  getHistory: () => [],
});

export function EconomyProvider({ children }) {
  const intervalRef = useRef(null);
  const [percentById, setPercentById] = useState({}); // { [nftId]: number }
  const [baseById, setBaseById] = useState({}); // { [nftId]: number }
  const [historyById, setHistoryById] = useState({}); // { [nftId]: Array<{t:number, price:number}> }
  const strategyRef = useRef(new RandomWalkStrategy());
  const nextDelta = useCallback((previousPercent) => {
    return strategyRef.current.nextDelta(previousPercent);
  }, []);

  const ensureTracked = useCallback((nftId, basePrice) => {
    if (!nftId) return;
    setBaseById((prev) => {
      if (prev[nftId] != null) return prev;
      const next = { ...prev, [nftId]: Number(basePrice) };
      return next;
    });
    setPercentById((prev) => {
      if (prev[nftId] != null) return prev;
      const next = { ...prev, [nftId]: 0 };
      return next;
    });
    setHistoryById((prev) => {
      if (prev[nftId]) return prev;
      const base = Number(basePrice) || 0;
      const price = parseFloat(base.toFixed(2));
      const now = Date.now();
      const next = { ...prev, [nftId]: [{ t: now, price }] };
      return next;
    });
  }, []);

  const computePrice = useCallback((nftId, basePrice) => {
    const pct = percentById[nftId] || 0;
    return computePriceUtil(basePrice, pct);
  }, [percentById]);

  const getPercentage = useCallback((nftId) => {
    return percentById[nftId] || 0;
  }, [percentById]);

  const getHistory = useCallback((nftId) => {
    return historyById[nftId] || [];
  }, [historyById]);

  const tick = useCallback(() => {
    setPercentById((prevPct) => {
      const ids = Object.keys(baseById);
      if (ids.length === 0) return prevPct;
      const nextPct = { ...prevPct };
      const now = Date.now();
      const updates = {};
      for (const id of ids) {
        const current = prevPct[id] || 0;
        const updated = parseFloat((current + nextDelta(current)).toFixed(2));
        nextPct[id] = updated;
        const base = Number(baseById[id]) || 0;
        const price = computePriceUtil(base, updated);
        updates[id] = { t: now, price };
      }
      setHistoryById((prevHist) => {
        const nextHist = { ...prevHist };
        for (const id of Object.keys(updates)) {
          const arr = nextHist[id] ? [...nextHist[id]] : [];
          arr.push(updates[id]);
          while (arr.length > MAX_HISTORY_POINTS) arr.shift();
          nextHist[id] = arr;
        }
        return nextHist;
      });
      return nextPct;
    });
  }, [baseById]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tick();
    }, 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tick]);

  const value = useMemo(() => ({
    getPercentage,
    ensureTracked,
    computePrice,
    getHistory,
  }), [getPercentage, ensureTracked, computePrice, getHistory]);

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEconomy() {
  return useContext(EconomyContext);
}
