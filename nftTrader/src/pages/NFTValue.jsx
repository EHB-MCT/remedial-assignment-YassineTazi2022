import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNftById } from '../services/nftService.js';
import { buyNft } from '../services/nftService.js';
import { fetchMyPurchasedNftIds } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';

export default function NFTValue() {
  const { nftId } = useParams();
  const { percentage, computePriceFromBase } = useEconomy();

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');
  const [owned, setOwned] = useState(false);
  const { refreshBalance } = useWallet();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNftById(nftId);
        if (isMounted) setNft(data);
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

  const currentPrice = computePriceFromBase(nft.basePrice);
  const sign = percentage > 0 ? '+' : '';

  return (
    <div className="container">
      <Link to="/" className="button button--link">← Back</Link>
      <div className="card">
        <h2>{nft.name}</h2>
        <p>Base price: € {nft.basePrice.toFixed(2)}</p>
        <p>Economy change: <strong>{sign}{percentage.toFixed(2)}%</strong></p>
        <p>Current price: <strong>€ {currentPrice.toFixed(2)}</strong></p>
        <div style={{ marginTop: '0.5rem' }}>
          <button
            className="button"
            disabled={buying || owned}
            onClick={async () => {
              setBuyMessage('');
              setBuying(true);
              try {
                const priceNow = computePriceFromBase(nft.basePrice);
                await buyNft(nft.id, priceNow, { basePriceEur: nft.basePrice });
                setBuyMessage('Purchase successful.');
                setOwned(true);
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
          {buyMessage && (
            <p style={{ marginTop: '0.5rem', color: buyMessage.includes('successful') ? '#138a36' : '#cc2936' }}>
              {buyMessage}
            </p>
          )}
        </div>
        <small>Updates every minute based on a random ±10% economy change.</small>
      </div>
    </div>
  );
}
