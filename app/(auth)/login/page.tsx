/* BioLoop account experience — a calm, precise login screen that routes users into the right operational workspace. */
'use client';

import Link from 'next/link';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { getCurrentUserProfile, signInUser } from '@/lib/auth';
import { dashboardPathForRole } from '@/lib/roles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const auth = await signInUser(email, password);
      let role = auth.user?.user_metadata?.role;
      try {
        const profile = await getCurrentUserProfile();
        role = profile?.role ?? role;
      } catch {
        // The dashboard hub will make a second profile check after navigation.
      }
      router.replace(dashboardPathForRole(role));
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Masuk belum bisa diproses. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell mode="login">
      <div className="bl-auth-heading"><p>Masuk ke BioLoop</p><h2>Lanjutkan pekerjaan yang penting.</h2><span>Gunakan akun yang sudah terdaftar untuk membuka ruang kerja Anda.</span></div>
      {errorMessage && <p className="bl-auth-alert" role="alert">{errorMessage}</p>}
      <form className="bl-auth-form" onSubmit={handleSubmit}>
        <label><span>Email</span><div><Mail size={17} aria-hidden="true" /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@bisnis.com" /></div></label>
        <label><span>Kata sandi</span><div><LockKeyhole size={17} aria-hidden="true" /><input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /></div></label>
        <button type="submit" disabled={isSubmitting} className="bl-auth-submit">{isSubmitting ? 'Memeriksa akun…' : <>Masuk ke dashboard <ArrowRight size={17} aria-hidden="true" /></>}</button>
      </form>
      <p className="bl-auth-switch">Belum punya akun? <Link href="/register">Daftar sebagai mitra</Link></p>
    </AuthShell>
  );
}
