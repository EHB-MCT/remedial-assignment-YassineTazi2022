import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNfts } from '../services/nftService.js';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <Link to={`/nft/${nft.id}`} className="button">View value</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
