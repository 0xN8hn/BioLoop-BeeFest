import { assertSupabaseConfigured, supabase } from './supabase';

export type UserRole = 'producer' | 'recycler' | 'driver' | 'admin';

// 1. Fungsi Registrasi
export async function signUpUser(email: string, password: string, fullName: string, role: UserRole) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
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

  // C. Jika data profil belum ada di tabel database (Auto-Create Fallback)
  if (!profile) {
    const fallbackProfile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User BioLoop',
      role: (user.user_metadata?.role as UserRole) || 'producer',
    };

    // Insert otomatis ke database agar ke depannya selalu ada
    await supabase.from('profiles').upsert([fallbackProfile]);
    return fallbackProfile;
  }

  return profile;
}

// 4. Fungsi Logout
export async function signOutUser() {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
