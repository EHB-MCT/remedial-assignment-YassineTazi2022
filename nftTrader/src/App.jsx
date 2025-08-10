import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { EconomyProvider } from './context/EconomyContext.jsx';
import Home from './pages/Home.jsx';
import NFTValue from './pages/NFTValue.jsx';

function App() {
  return (
    <EconomyProvider>
      <BrowserRouter>
        <header className="site-header">
          <nav className="nav">
            <Link to="/" className="brand">NFT Trading Game</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nft/:nftId" element={<NFTValue />} />
          </Routes>
        </main>
      </BrowserRouter>
    </EconomyProvider>
  );
}

export default App
