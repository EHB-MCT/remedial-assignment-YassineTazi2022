-- Basic schema for the NFT trading game

create table if not exists public.nfts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price numeric(12,2) not null,
  image_url text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key,
  balance_eur numeric(12,2) not null default 0
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nft_id uuid not null references public.nfts(id) on delete cascade,
  price_eur numeric(12,2) not null,
  base_price_eur numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  price_eur numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_purchases_user on public.purchases(user_id);
create index if not exists idx_purchases_nft on public.purchases(nft_id);
create index if not exists idx_sales_purchase on public.sales(purchase_id);


