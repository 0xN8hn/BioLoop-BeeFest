import { assertSupabaseConfigured, supabase } from './supabase';

export type UserRole = 'producer' | 'recycler' | 'admin';

// 1. Fungsi Registrasi
export async function signUpUser(email: string, password: string, fullName: string, role: UserRole) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        role: role,
      },
    },
  });

  if (error) throw error;
  return data;
}

// 2. Fungsi Login
export async function signInUser(email: string, password: string) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Server-side guard: creates or retrieves the profile using auth.uid() inside Supabase.
// This avoids trusting a browser-supplied producer ID when creating a waste listing.
export async function ensureCurrentUserProfile() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc('ensure_bioloop_profile');
  if (error) throw error;
  if (!data) throw new Error('Profil BioLoop belum dapat disiapkan. Pastikan SQL profile guard sudah dijalankan.');
  return data;
}

// 3. Fungsi Ambil Profil (AMUNISI BARU: Anti-Crash & Auto-Create Profile)
export async function getCurrentUserProfile() {
  assertSupabaseConfigured();
  // A. Ambil user aktif dari auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // B. Ambil data dari tabel profiles (Pakai maybeSingle agar tidak throw error)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error.message);
  }

  // C. Jika data profil belum ada di tabel database, minta server membuatnya berdasarkan auth.uid().
  //    Listing memakai foreign key producer_id -> profiles.id, jadi fallback tidak boleh dikembalikan sebelum parent row ada.
  if (!profile) {
    try {
      return await ensureCurrentUserProfile();
    } catch (guardError) {
      if (error) console.error('Profile guard failed after profile lookup:', guardError);
      throw guardError;
    }
  }

  return profile;
}

/* Legacy compatibility path kept below for historical schema notes.
   The server-side RPC above is the authoritative profile creation method. */
export async function synchronizeLegacyProfileShape() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

    const profileName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User BioLoop';
    const metadataRole = user.user_metadata?.role;
    const profileRole: UserRole = metadataRole === 'producer' || metadataRole === 'recycler' || metadataRole === 'admin'
      ? metadataRole
      : 'recycler';
    const primaryPayload = {
      id: user.id,
      email: user.email || '',
      full_name: profileName,
      role: profileRole,
    };

    let { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(primaryPayload, { onConflict: 'id' })
      .select('*')
      .single();

    // Some existing BioLoop schemas call the display column `name` rather than `full_name`.
    // Retry with that compatible payload only when the first schema shape is rejected.
    if (createError && /full_name|schema cache|column/i.test(createError.message)) {
      const compatiblePayload = {
        id: user.id,
        email: user.email || '',
        name: profileName,
        role: profileRole,
      };
      const retry = await supabase
        .from('profiles')
        .upsert(compatiblePayload, { onConflict: 'id' })
        .select('*')
        .single();
      createdProfile = retry.data;
      createError = retry.error;
    }

    if (createError || !createdProfile) {
      throw new Error(createError?.message || 'Profil Anda belum dapat disiapkan. Coba masuk kembali sebelum membuat listing.');
    }
    return createdProfile;
}

// 4. Fungsi Logout
export async function signOutUser() {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
