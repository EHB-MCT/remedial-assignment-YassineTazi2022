import { supabase } from '../lib/supabaseClient.js';
import { ensureWalletForCurrentUser, debitMyWallet, creditMyWallet } from './walletService.js';

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
}

function mapNft(row) {
  return {
    id: row.id,
    name: row.name,
    basePrice: Number(row.base_price),
    imageUrl: row.image_url ?? null,
    metadata: row.metadata ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  };
}

export async function fetchNfts() {
  assertSupabase();
  const { data, error } = await supabase
    .from('nfts')
    .select('id, name, base_price, image_url, metadata, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to fetch NFTs');
  }
  return (data || []).map(mapNft);
}

export async function fetchNftById(id) {
  assertSupabase();
  const { data, error } = await supabase
    .from('nfts')
    .select('id, name, base_price, image_url, metadata, created_at')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to fetch NFT');
  }
  return mapNft(data);
}

export async function buyNft(nftId, priceEur, options = {}) {
  assertSupabase();
  const { basePriceEur = null } = options;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(userError.message || 'Failed to resolve current user');
  }
  if (!user) {
    throw new Error('You must be signed in to buy an NFT');
  }
  // Ensure wallet exists
  await ensureWalletForCurrentUser();

  // Prevent duplicate unsold ownership before debiting
  const { data: existingPurchases, error: existingErr } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('nft_id', nftId);
  if (existingErr) {
    throw new Error(existingErr.message || 'Failed to check ownership');
  }
  if ((existingPurchases || []).length > 0) {
    const ids = existingPurchases.map((p) => p.id);
    const { data: salesRows, error: salesErr } = await supabase
      .from('sales')
      .select('purchase_id')
      .in('purchase_id', ids);
    if (salesErr) {
      throw new Error(salesErr.message || 'Failed to check ownership');
    }
    const soldSet = new Set((salesRows || []).map((s) => s.purchase_id));
    const hasUnsold = ids.some((pid) => !soldSet.has(pid));
    if (hasUnsold) {
      throw new Error('You already own this NFT');
    }
  }

  // Debit wallet and try to create purchase. Rollback debit on failure.
  await debitMyWallet(Number(priceEur));
  const payload = {
    nft_id: nftId,
    price_eur: Number(priceEur),
    base_price_eur: basePriceEur != null ? Number(basePriceEur) : null,
    user_id: user.id,
  };
  // Remove nulls that might violate schema if column doesn't exist
  if (payload.base_price_eur == null) {
    delete payload.base_price_eur;
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert([payload])
    .select('id, nft_id, price_eur, created_at')
    .single();

  if (error) {
    try { await creditMyWallet(Number(priceEur)); } catch (_) {}
    throw new Error(error.message || 'Failed to create purchase');
  }
  return data;
}

export async function fetchMyPurchases() {
  assertSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(userError.message || 'Failed to resolve current user');
  }
  if (!user) {
    throw new Error('You must be signed in to view your NFTs');
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, nft_id, price_eur, base_price_eur, created_at, nfts(id, name, base_price, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message || 'Failed to fetch purchases');
  }
  const ids = (purchases || []).map((p) => p.id);
  let salesByPurchaseId = {};
  if (ids.length > 0) {
    const { data: sales, error: salesErr } = await supabase
      .from('sales')
      .select('purchase_id, price_eur, created_at')
      .in('purchase_id', ids);
    if (salesErr) {
      throw new Error(salesErr.message || 'Failed to fetch sales');
    }
    salesByPurchaseId = (sales || []).reduce((acc, s) => {
      acc[s.purchase_id] = s;
      return acc;
    }, {});
  }
  return (purchases || []).map((row) => {
    const nft = row.nfts || {};
    const sale = salesByPurchaseId[row.id];
    return {
      id: row.id,
      nftId: row.nft_id,
      priceEur: Number(row.price_eur),
      basePriceAtPurchase: row.base_price_eur != null ? Number(row.base_price_eur) : null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      soldAt: sale?.created_at ? new Date(sale.created_at) : null,
      soldPriceEur: sale?.price_eur != null ? Number(sale.price_eur) : null,
      nft: {
        id: nft.id,
        name: nft.name,
        basePrice: nft.base_price != null ? Number(nft.base_price) : null,
        imageUrl: nft.image_url ?? null,
      },
    };
  });
}

export async function fetchMyPurchasedNftIds() {
  assertSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(userError.message || 'Failed to resolve current user');
  }
  if (!user) {
    throw new Error('You must be signed in to view your NFTs');
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('id, nft_id')
    .eq('user_id', user.id);
  if (error) {
    throw new Error(error.message || 'Failed to fetch purchases');
  }
  const ids = (purchases || []).map((p) => p.id);
  if (ids.length === 0) return new Set();
  const { data: sales, error: salesErr } = await supabase
    .from('sales')
    .select('purchase_id')
    .in('purchase_id', ids);
  if (salesErr) {
    throw new Error(salesErr.message || 'Failed to fetch sales');
  }
  const soldSet = new Set((sales || []).map((s) => s.purchase_id));
  const unsold = (purchases || []).filter((p) => !soldSet.has(p.id));
  return new Set(unsold.map((r) => r.nft_id));
}

export async function sellPurchase(purchaseId, priceEur) {
  assertSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(userError.message || 'Failed to resolve current user');
  }
  if (!user) {
    throw new Error('You must be signed in to sell an NFT');
  }
  const price = Number(priceEur);
  if (!(price > 0)) throw new Error('Sale price must be positive');
  // Create sale row if not already sold
  const { data: sale, error: saleErr } = await supabase
    .from('sales')
    .insert([{ purchase_id: purchaseId, price_eur: price }])
    .select('id, created_at')
    .single();
  if (saleErr) {
    throw new Error(saleErr.message || 'Failed to sell NFT');
  }
  // Credit wallet
  await ensureWalletForCurrentUser();
  await creditMyWallet(price);
  return sale;
}