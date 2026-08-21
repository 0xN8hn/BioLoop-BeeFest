/* BioLoop account experience — a clear registration flow that starts each partner in a role-specific workspace. */
'use client';

import Link from 'next/link';
import { ArrowRight, Building2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth-shell';
import { signUpUser, type UserRole } from '@/lib/auth';
import { dashboardPathForRole } from '@/lib/roles';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('producer');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const data = await signUpUser(email, password, fullName, role);
      if (data.session) {
        router.replace(dashboardPathForRole(role));
        router.refresh();
        return;
      }
      setMessage('Akun dibuat. Cek email Anda bila verifikasi email diaktifkan, lalu masuk untuk melanjutkan.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Pendaftaran belum bisa diproses. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell mode="register">
      <div className="bl-auth-heading"><p>Daftar mitra BioLoop</p><h2>Mulai dari cara Anda berkontribusi.</h2><span>Pilih sebagai penghasil material atau pembeli material organik. Armada lokal dipesan sebagai layanan pada setiap transaksi.</span></div>
      {errorMessage && <p className="bl-auth-alert" role="alert">{errorMessage}</p>}
      {message && <p className="bl-auth-message">{message}</p>}
      <form className="bl-auth-form" onSubmit={handleSubmit}>
        <label><span>Nama lengkap atau perusahaan</span><div><UserRound size={17} aria-hidden="true" /><input type="text" required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Contoh: Dapur Sore" /></div></label>
        <label><span>Peran Anda</span><div><Building2 size={17} aria-hidden="true" /><select value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="producer">Usaha makanan / penghasil sisa organik</option><option value="recycler">Pembeli material — BSF, pakan, atau kompos</option></select></div></label>
        <label><span>Email</span><div><Mail size={17} aria-hidden="true" /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@bisnis.com" /></div></label>
        <label><span>Kata sandi</span><div><LockKeyhole size={17} aria-hidden="true" /><input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" /></div></label>
        <button type="submit" disabled={isSubmitting} className="bl-auth-submit">{isSubmitting ? 'Membuat akun…' : <>Buat akun BioLoop <ArrowRight size={17} aria-hidden="true" /></>}</button>
      </form>
      <p className="bl-auth-switch">Sudah punya akun? <Link href="/login">Masuk di sini</Link></p>
    </AuthShell>
  );
}
