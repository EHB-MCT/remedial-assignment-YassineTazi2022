import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sampleNfts, getNftById } from '../data/nfts.js';
import { useEconomy } from '../context/EconomyContext.jsx';

export default function NFTValue() {
  const { nftId } = useParams();
  const nft = useMemo(() => getNftById(nftId), [nftId]);
  const { percentage, computePriceFromBase } = useEconomy();

  if (!nft) {
    return (
      <div className="container">
        <p>NFT not found.</p>
        <Link to="/" className="button">Back</Link>
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
