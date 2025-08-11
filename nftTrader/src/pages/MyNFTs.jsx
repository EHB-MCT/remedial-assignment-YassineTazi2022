import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyPurchases } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';

export default function MyNFTs() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { computePriceFromBase } = useEconomy();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchMyPurchases();
        if (isMounted) setPurchases(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load your NFTs');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>My NFTs</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>My NFTs</h2>
        <p style={{ color: 'crimson' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>My NFTs</h2>
      {purchases.length === 0 ? (
        <p>You don't own any NFTs yet.</p>
      ) : (
        <div className="grid">
          {purchases.map((p) => {
            const base = p.nft?.basePrice ?? p.basePriceAtPurchase ?? 0;
            const currentPrice = base ? computePriceFromBase(base) : null;
            const isUp = currentPrice != null && p.basePriceAtPurchase != null && currentPrice > p.basePriceAtPurchase;
            const isDown = currentPrice != null && p.basePriceAtPurchase != null && currentPrice < p.basePriceAtPurchase;
            const arrow = isUp ? '▲' : isDown ? '▼' : '—';
            const trendClass = isUp ? 'trend trend--up' : isDown ? 'trend trend--down' : 'trend';

            return (
              <div key={p.id} className="card">
                <h3>{p.nft?.name || `NFT #${p.nftId}`}</h3>
                <p>Bought for: <strong>€ {p.priceEur.toFixed(2)}</strong></p>
                <p>Purchased: {p.createdAt ? p.createdAt.toLocaleString() : '—'}</p>
                {currentPrice != null && (
                  <p>
                    Current est.: <strong>€ {currentPrice.toFixed(2)}</strong>
                    <span className={trendClass} aria-label={isUp ? 'Up' : isDown ? 'Down' : 'No change'}>{arrow}</span>
                  </p>
                )}
                <Link to={`/nft/${p.nftId}`} className="button">View details</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


