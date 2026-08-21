'use client';

import { useState } from 'react';
import { signUpUser, signInUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'producer' | 'recycler' | 'driver'>('producer');
  const [errorMsg, setErrorMsg] = useState('');
  

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg('');

  try {
    if (isRegister) {
      await signUpUser(email, password, fullName, role);
      alert('Registrasi berhasil! Silakan login.');
      setIsRegister(false);
    } else {
      // 1. Proses Login Supabase
      await signInUser(email, password);

      // 2. PAKAI INI (Ganti router.push) agar browser reload & sync cookie sesi Supabase
      window.location.href = '/';
    }
  } catch (err: any) {
    setErrorMsg(err.message || 'Terjadi kesalahan saat masuk');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center text-emerald-700">
          {isRegister ? 'Daftar Akun BioLoop' : 'Masuk ke BioLoop'}
        </h2>

        {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-xs rounded">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap / Perusahaan</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="Contoh: Restoran Padang Jaya"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Peran (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="producer">Restoran / Penghasil Limbah</option>
                  <option value="recycler">Pengolah / Maggot Farmer</option>
                  <option value="driver">Kurir Logistik</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="email@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-emerald-700"
          >
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-600 font-semibold underline"
          >
            {isRegister ? 'Login di sini' : 'Daftar di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}