import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNfts } from '../services/nftService.js';
import { buyNft } from '../services/nftService.js';
import { fetchMyPurchasedNftIds } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { ensureTracked, computePrice, getPercentage } = useEconomy();
  const [buyingId, setBuyingId] = useState(null);
  const [buyStatusById, setBuyStatusById] = useState({});
  const [ownedIds, setOwnedIds] = useState(new Set());
  const { refreshBalance } = useWallet();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNfts();
        if (isMounted) setNfts(data);
        // Ensure each NFT is tracked for per-NFT economy
        data.forEach((n) => ensureTracked(n.id, n.basePrice));
        try {
          const ids = await fetchMyPurchasedNftIds();
          if (isMounted) setOwnedIds(ids);
        } catch (_) {
          if (isMounted) setOwnedIds(new Set());
        }
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
              const currentPrice = computePrice(nft.id, nft.basePrice);
              const pct = getPercentage(nft.id);
              const isUp = pct > 0 && currentPrice > nft.basePrice;
              const isDown = pct < 0 && currentPrice < nft.basePrice;
              const arrow = isUp ? '▲' : isDown ? '▼' : '—';
              const trendClass = isUp ? 'trend trend--up' : isDown ? 'trend trend--down' : 'trend';
              return (
                <>
                  <p>
                    Current price: <strong>€ {currentPrice.toFixed(2)}</strong>
                    <span className={trendClass} aria-label={isUp ? 'Up' : isDown ? 'Down' : 'No change'}>{arrow}</span>
                  </p>
                  <div style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                    <button
                      className="button"
                      disabled={buyingId === nft.id || ownedIds.has(nft.id)}
                      onClick={async () => {
                        setBuyStatusById((prev) => ({ ...prev, [nft.id]: '' }));
                        setBuyingId(nft.id);
                        try {
                          const priceNow = computePrice(nft.id, nft.basePrice);
                          await buyNft(nft.id, priceNow, { basePriceEur: nft.basePrice });
                          setBuyStatusById((prev) => ({ ...prev, [nft.id]: 'Purchase successful.' }));
                          setOwnedIds((prev) => new Set([...prev, nft.id]));
                          await refreshBalance();
                        } catch (e) {
                          setBuyStatusById((prev) => ({ ...prev, [nft.id]: e.message || 'Purchase failed' }));
                        } finally {
                          setBuyingId(null);
                        }
                      }}
                    >
                      {ownedIds.has(nft.id) ? 'Already owned' : buyingId === nft.id ? 'Buying…' : 'Buy at current price'}
                    </button>
                    {buyStatusById[nft.id] && (
                      <p style={{ marginTop: '0.25rem', color: buyStatusById[nft.id].includes('successful') ? '#138a36' : '#cc2936' }}>
                        {buyStatusById[nft.id]}
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
            <Link to={`/nft/${nft.id}`} className="button">View value</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
