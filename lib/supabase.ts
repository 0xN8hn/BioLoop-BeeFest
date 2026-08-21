import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Konfigurasi Supabase belum tersedia. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY untuk menggunakan akun BioLoop.');
  }
}

// A safe local fallback keeps the public landing and auth screen renderable in previews.
// Auth helpers below block network actions until genuine environment variables are present.
export const supabase = createClient(
  supabaseUrl ?? 'https://preview-not-configured.supabase.co',
  supabaseAnonKey ?? 'preview-anon-key-not-configured',
);

// Helper untuk memanggil Atomic Claim SQL Function
export async function safeClaimListing(listingId: string, recyclerId: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('claim_waste_listing', {
    listing_id: listingId,
    recycler_id: recyclerId,
  });

  if (error) throw error;
  return data; // returns true jika sukses, false jika sudah diklaim orang lain
}
