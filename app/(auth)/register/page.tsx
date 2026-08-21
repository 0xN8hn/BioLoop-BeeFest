'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { signUpUser, type UserRole } from '@/lib/auth';

export default function RegisterPage() {
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
      await signUpUser(email, password, fullName, role);
      setMessage('Akun Anda berhasil dibuat. Silakan masuk untuk melanjutkan.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registrasi belum bisa diproses. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-5 py-12 text-[#2b2927] sm:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-md place-items-center">
        <section className="w-full border border-[#ddcfc1] bg-[#fffaf4] p-7 shadow-[0_18px_48px_rgba(43,41,39,0.08)] sm:p-9">
          <Link href="/" className="text-sm font-extrabold tracking-[-0.05em] text-[#2b2927]">BioLoop</Link>
          <h1 className="mt-10 text-4xl font-bold tracking-[-0.07em]">Mari mulai alurnya.</h1>
          <p className="mt-4 text-sm leading-6 text-[#625b55]">Daftarkan bisnis Anda dan arahkan sisa organik ke rute yang lebih berguna.</p>

          {errorMessage && <p className="mt-6 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
          {message && <p className="mt-6 border border-[#cdbdad] bg-[#f0e5da] p-3 text-sm text-[#5c3b32]">{message}</p>}

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold">Nama lengkap atau perusahaan
              <input type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full border border-[#d8ccc0] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#b95e45]" placeholder="Contoh: Restoran Padang Jaya" />
            </label>
            <label className="block text-sm font-semibold">Peran
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="mt-2 w-full border border-[#d8ccc0] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#b95e45]">
                <option value="producer">Usaha makanan / penghasil sisa organik</option>
                <option value="recycler">Pengolah Black Soldier Fly</option>
                <option value="driver">Mitra logistik</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">Email
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-[#d8ccc0] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#b95e45]" placeholder="email@domain.com" />
            </label>
            <label className="block text-sm font-semibold">Kata sandi
              <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border border-[#d8ccc0] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#b95e45]" placeholder="Minimal 6 karakter" />
            </label>
            <button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-[#b95e45] px-4 py-3 text-sm font-bold text-[#fffaf4] transition hover:bg-[#983f31] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Membuat akun…' : 'Buat akun BioLoop'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#625b55]">Sudah punya akun? <Link href="/login" className="font-bold text-[#b95e45] underline underline-offset-4">Masuk di sini</Link></p>
        </section>
      </div>
    </main>
  );
}
