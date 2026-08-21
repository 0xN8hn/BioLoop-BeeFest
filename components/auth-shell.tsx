/* BioLoop account experience — charcoal, clay, oatmeal, and focused account setup without decorative noise. */
import Link from 'next/link';
import { ArrowUpRight, Leaf } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthShellProps = {
  mode: 'login' | 'register';
  children: ReactNode;
};

export function AuthShell({ mode, children }: AuthShellProps) {
  const isLogin = mode === 'login';

  return (
    <main className="bl-account-screen">
      <div className="bl-account-grid">
        <aside className="bl-account-story">
          <Link href="/" className="bl-account-brand" aria-label="Kembali ke beranda BioLoop">
            <span><Leaf size={19} strokeWidth={2.4} aria-hidden="true" /></span> BioLoop
          </Link>
          <div className="bl-account-story-copy">
            <p className="bl-account-kicker">Alur yang lebih terarah</p>
            <h1>{isLogin ? <>Selamat datang kembali.<br />Mari lanjutkan <em>alurnya.</em></> : <>Sisa organik punya <em>rute</em> yang lebih baik.</>}</h1>
            <p>{isLogin ? 'Masuk untuk melihat penjemputan, aktivitas pengolahan, dan pekerjaan yang perlu diteruskan hari ini.' : 'Buat akun sesuai peran Anda. BioLoop akan menyiapkan ruang kerja yang relevan sejak awal.'}</p>
          </div>
          <div className="bl-account-story-note">
            <span>01</span><p>Informasi operasional yang sama, untuk peran yang berbeda.</p><ArrowUpRight size={18} aria-hidden="true" />
          </div>
        </aside>
        <section className="bl-account-form-column">
          <div className="bl-account-form-wrap">{children}</div>
        </section>
      </div>
    </main>
  );
}
