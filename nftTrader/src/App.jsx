import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { EconomyProvider } from './context/EconomyContext.jsx';
import Home from './pages/Home.jsx';
import NFTValue from './pages/NFTValue.jsx';
import MyNFTs from './pages/MyNFTs.jsx';
import Auth from './pages/Auth.jsx';

function App() {
  return (
    <EconomyProvider>
      <BrowserRouter>
        <header className="site-header">
          <nav className="nav">
            <Link to="/" className="brand">NFT Trading Game</Link>
            <span style={{ marginLeft: '1rem' }}>
              <Link to="/my-nfts" className="button button--link">My NFTs</Link>
            </span>
            <span style={{ marginLeft: '1rem' }}>
              <Link to="/auth" className="button button--link">Sign in</Link>
            </span>
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
    </EconomyProvider>
  );
}

export default App
