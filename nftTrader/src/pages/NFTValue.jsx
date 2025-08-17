import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNftById } from '../services/nftService.js';
import { buyNft } from '../services/nftService.js';
import { fetchMyPurchasedNftIds } from '../services/nftService.js';
import { fetchMyPurchases } from '../services/nftService.js';
import { sellPurchase } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';

export default function NFTValue() {
  const { nftId } = useParams();
  const { ensureTracked, computePrice, getPercentage, getHistory } = useEconomy();

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');
  const [owned, setOwned] = useState(false);
  const [selling, setSelling] = useState(false);
  const [sellMessage, setSellMessage] = useState('');
  const [unsoldPurchaseId, setUnsoldPurchaseId] = useState(null);
  const { refreshBalance } = useWallet();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNftById(nftId);
        if (isMounted) setNft(data);
        ensureTracked(nftId, data.basePrice);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load NFT');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    // Check ownership; ignore failures if unauthenticated
    async function checkOwned() {
      try {
        const ids = await fetchMyPurchasedNftIds();
        if (isMounted) setOwned(ids.has(nftId));
      } catch (_) {
        if (isMounted) setOwned(false);
      }
    }
    checkOwned();

    // Resolve the user's unsold purchase id for this NFT, if any
    async function resolveUnsoldPurchase() {
      try {
        const purchases = await fetchMyPurchases();
        if (!isMounted) return;
        const found = purchases.find((p) => p.nftId === nftId && !p.soldAt);
        setUnsoldPurchaseId(found ? found.id : null);
      } catch (_) {
        if (isMounted) setUnsoldPurchaseId(null);
      }
    }
    resolveUnsoldPurchase();
    return () => {
      isMounted = false;
    };
  }, [nftId]);

  if (loading) {
    return (
      <div className="container">
        <Link to="/" className="button button--link">← Back</Link>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Link to="/" className="button button--link">← Back</Link>
        <p style={{ color: 'crimson' }}>{error}</p>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container">
        <Link to="/" className="button button--link">← Back</Link>
        <p>NFT not found.</p>
      </div>
    );
  }

  const currentPrice = computePrice(nft.id, nft.basePrice);
  const percentage = getPercentage(nft.id);
  const sign = percentage > 0 ? '+' : '';
  const history = getHistory(nft.id);

  function Chart({ points }) {
    const w = 300;
    const h = 120;
    if (!points || points.length < 2) {
      return <svg width={w} height={h} />;
    }
    const values = points.map((p) => p.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const dx = w / (points.length - 1);
    const path = points.map((p, i) => {
      const x = i * dx;
      const y = h - ((p.price - min) / span) * (h - 10) - 5;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
    return (
      <svg width={w} height={h} style={{ border: '1px solid #e5e5e5', background: '#fafafa' }}>
        <path d={path} fill="none" stroke="#2a6f97" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="button button--link">← Back</Link>
      <div className="card">
        <h2>{nft.name}</h2>
        <p>Base price: € {nft.basePrice.toFixed(2)}</p>
        <p>Economy change: <strong>{sign}{percentage.toFixed(2)}%</strong></p>
        <p>Current price: <strong>€ {currentPrice.toFixed(2)}</strong></p>
        <div style={{ margin: '0.5rem 0' }}>
          <Chart points={history} />
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="button"
            disabled={buying || owned}
            onClick={async () => {
              setBuyMessage('');
              setBuying(true);
              try {
                const priceNow = computePrice(nft.id, nft.basePrice);
                await buyNft(nft.id, priceNow, { basePriceEur: nft.basePrice });
                setBuyMessage('Purchase successful.');
                setOwned(true);
                // Attempt to find the new purchase id
                try {
                  const purchases = await fetchMyPurchases();
                  const found = purchases.find((p) => p.nftId === nft.id && !p.soldAt);
                  setUnsoldPurchaseId(found ? found.id : null);
                } catch (_) {}
                await refreshBalance();
              } catch (e) {
                setBuyMessage(e.message || 'Purchase failed');
              } finally {
                setBuying(false);
              }
            }}
          >
            {owned ? 'Already owned' : buying ? 'Buying…' : 'Buy at current price'}
          </button>
          <button
            className="button"
            disabled={selling || !owned || !unsoldPurchaseId}
            onClick={async () => {
              setSellMessage('');
              setSelling(true);
              try {
                const priceNow = computePrice(nft.id, nft.basePrice);
                if (!unsoldPurchaseId) throw new Error('No purchase to sell');
                await sellPurchase(unsoldPurchaseId, priceNow);
                setSellMessage('Sold successfully.');
                setOwned(false);
                setUnsoldPurchaseId(null);
                await refreshBalance();
              } catch (e) {
                setSellMessage(e.message || 'Sell failed');
              } finally {
                setSelling(false);
              }
            }}
          >
            {selling ? 'Selling…' : 'Sell at current price'}
          </button>
          {buyMessage && (
            <p style={{ marginTop: '0.5rem', color: buyMessage.includes('successful') ? '#138a36' : '#cc2936' }}>
              {buyMessage}
            </p>
          )}
          {sellMessage && (
            <p style={{ marginTop: '0.5rem', color: sellMessage.includes('success') ? '#138a36' : '#cc2936' }}>
              {sellMessage}
            </p>
          )}
        </div>
        <small>Updates every 10s based on a random ±10% economy change.</small>
      </div>
    </div>
  );
}
