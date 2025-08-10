import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNftById } from '../services/nftService.js';
import { useEconomy } from '../context/EconomyContext.jsx';

export default function NFTValue() {
  const { nftId } = useParams();
  const { percentage, computePriceFromBase } = useEconomy();

  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <small>Updates every minute based on a random ±10% economy change.</small>
      </div>
    </div>
  );
}
