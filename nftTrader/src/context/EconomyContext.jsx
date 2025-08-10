import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const EconomyContext = createContext({
  percentage: 0,
  tick: () => {},
  computePriceFromBase: (base) => base,
});

export function EconomyProvider({ children }) {
  const [percentage, setPercentage] = useState(0);
  const intervalRef = useRef(null);

  const randomDelta = () => {
    const delta = Math.random() * 20 - 10; // [-10, 10)
    return parseFloat(delta.toFixed(2));
  };

  const tick = () => {
    setPercentage((prev) => parseFloat((prev + randomDelta()).toFixed(2)));
  };

  useEffect(() => {
    // Start ticking every minute
    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const computePriceFromBase = useMemo(() => {
    return (basePrice) => {
      const price = Number(basePrice) * (1 + percentage / 100);
      return parseFloat(price.toFixed(2));
    };
  }, [percentage]);

  const value = useMemo(() => ({ percentage, tick, computePriceFromBase }), [percentage]);

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy() {
  return useContext(EconomyContext);
}
