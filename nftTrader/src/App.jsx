import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { EconomyProvider } from './context/EconomyContext.jsx';
import { WalletProvider, useWallet } from './context/WalletContext.jsx';
import Home from './pages/Home.jsx';
import NFTValue from './pages/NFTValue.jsx';
import MyNFTs from './pages/MyNFTs.jsx';
import Auth from './pages/Auth.jsx';

function HeaderWallet() {
  const { balance, loading, error } = useWallet();
  return (
    <span style={{ marginLeft: 'auto' }}>
      {error ? (
        <span style={{ color: 'crimson' }}>Wallet error</span>
      ) : loading ? (
        <span>Balance: …</span>
      ) : balance != null ? (
        <span>Balance: € {balance.toFixed(2)}</span>
      ) : (
        <span>Balance: —</span>
      )}
    </span>
  );
}

function App() {
  return (
    <EconomyProvider>
      <WalletProvider>
        <BrowserRouter>
          <header className="site-header">
            <nav className="nav" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" className="brand">NFT Trading Game</Link>
              <Link to="/my-nfts" className="button button--link">My NFTs</Link>
              <Link to="/auth" className="button button--link">Sign in</Link>
              <HeaderWallet />
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nft/:nftId" element={<NFTValue />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </BrowserRouter>
      </WalletProvider>
    </EconomyProvider>
  );
}

export default App
