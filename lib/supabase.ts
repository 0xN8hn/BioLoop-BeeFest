import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper untuk memanggil Atomic Claim SQL Function
export async function safeClaimListing(listingId: string, recyclerId: string) {
  const { data, error } = await supabase.rpc('claim_waste_listing', {
    listing_id: listingId,
    recycler_id: recyclerId,
  });

  if (error) throw error;
  return data; // returns true jika sukses, false jika sudah diklaim orang lain
}
