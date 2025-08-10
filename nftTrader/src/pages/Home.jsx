import React from 'react';
import { Link } from 'react-router-dom';
import { sampleNfts } from '../data/nfts.js';

export default function Home() {
  return (
    <div className="container">
      <h2>Available NFTs</h2>
      <div className="grid">
        {sampleNfts.map((nft) => (
          <div key={nft.id} className="card">
            <h3>{nft.name}</h3>
            <p>Base price: € {nft.basePrice.toFixed(2)}</p>
            <Link to={`/nft/${nft.id}`} className="button">View value</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
