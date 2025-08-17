## Architecture Overview

The `nftTrader` app is a small React + Vite SPA organized by layers:

- UI (pages/components): `src/pages/*`, `src/App.jsx` render views and delegate to hooks/services.
- Contexts: `src/context/*` hold app-wide state and expose a small API (Economy, Wallet).
- Services: `src/services/*` encapsulate data access and mutations to Supabase tables.
- Lib (pure logic): `src/lib/*` reusable, framework-agnostic helpers (pricing, strategies, client setup).
- Data: `src/data/*` optional local data for scaffolding.

### Data storage
- Supabase Postgres + Row Level Security. Schema in `supabase/schema.sql`.
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see project README).

### Routing
`react-router-dom` for pages: Home, NFT details, My NFTs, Auth.

### State
- `EconomyContext`: per-NFT percentage drift and history (10s tick).
- `WalletContext`: current wallet balance for the signed-in user.

### Testing
- `vitest` for unit tests. Example: `src/lib/pricing.test.js`.


