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
