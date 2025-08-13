# NFT Trading Game (React + Vite)

A simple NFT trading game scaffold. The economy changes every 10 seconds by a random percentage between -10% and 10%, which affects NFT prices derived from their base euro value.

## Setup

1. Install dependencies:

```
npm install
```

2. Configure Supabase for persistence:
   - Copy `env.example` to `.env` (or `.env.local`) and fill values:
     - `VITE_SUPABASE_URL=...`
     - `VITE_SUPABASE_ANON_KEY=...`
   - In the Supabase SQL editor, run the SQL from `supabase/schema.sql` to create tables and policies.

## Scripts

- `npm run dev`: start dev server
- `npm run build`: build for production

## Project Structure

- `src/context/EconomyContext.jsx`: economy simulation (cumulative random ±10% every minute)
- `src/context/WalletContext.jsx`: wallet state and balance loader
- `src/pages/Home.jsx`: lists sample NFTs
- `src/pages/NFTValue.jsx`: shows live price for an NFT
- `src/data/nfts.js`: sample NFTs and helpers
- `src/lib/supabaseClient.js`: Supabase client (if env vars provided)
- `src/services/walletService.js`: wallet CRUD (balance, debit, credit)
- `src/services/nftService.js`: NFT fetch, buy and sell

## Notes

- CSS uses standard CSS in `src/App.css`.
- Routing via `react-router-dom`.
- Extend `sampleNfts` and replace with Supabase-backed data later.

## Gameplay

- Each signed-in user gets a wallet starting at € 300 (persisted in Supabase).
- Buying an NFT debits the wallet; selling credits it. Ownership is tracked via `purchases` and `sales`.
