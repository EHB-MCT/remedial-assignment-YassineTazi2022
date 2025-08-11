import { supabase } from '../lib/supabaseClient.js';

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

  const { data, error } = await supabase
    .from('purchases')
    .select('id, nft_id, price_eur, base_price_eur, created_at, nfts(id, name, base_price, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch purchases');
  }

  return (data || []).map((row) => {
    const nft = row.nfts || {};
    return {
      id: row.id,
      nftId: row.nft_id,
      priceEur: Number(row.price_eur),
      basePriceAtPurchase: row.base_price_eur != null ? Number(row.base_price_eur) : null,
      createdAt: row.created_at ? new Date(row.created_at) : null,
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

  const { data, error } = await supabase
    .from('purchases')
    .select('nft_id')
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message || 'Failed to fetch purchases');
  }
  return new Set((data || []).map((r) => r.nft_id));
}