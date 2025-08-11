import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNfts } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { computePriceFromBase } = useEconomy();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNfts();
        if (isMounted) setNfts(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load NFTs');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2>Available NFTs</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>Available NFTs</h2>
        <p style={{ color: 'crimson' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Available NFTs</h2>
      <div className="grid">
        {nfts.map((nft) => (
          <div key={nft.id} className="card">
            <h3>{nft.name}</h3>
            <p>Base price: € {nft.basePrice.toFixed(2)}</p>
            {(() => {
              const currentPrice = computePriceFromBase(nft.basePrice);
              const isUp = currentPrice > nft.basePrice;
              const isDown = currentPrice < nft.basePrice;
              const arrow = isUp ? '▲' : isDown ? '▼' : '—';
              const trendClass = isUp ? 'trend trend--up' : isDown ? 'trend trend--down' : 'trend';
              return (
                <p>
                  Current price: <strong>€ {currentPrice.toFixed(2)}</strong>
                  <span className={trendClass} aria-label={isUp ? 'Up' : isDown ? 'Down' : 'No change'}>{arrow}</span>
                </p>
              );
            })()}
            <Link to={`/nft/${nft.id}`} className="button">View value</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
