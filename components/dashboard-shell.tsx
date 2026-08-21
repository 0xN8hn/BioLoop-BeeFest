/* BioLoop operational shell — a quiet, consistent workspace for every role, using data-led hierarchy and warm contrast. */
'use client';

import Link from 'next/link';
import { ArrowLeft, Leaf, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';
import { roleLabel } from '@/lib/roles';

type DashboardShellProps = {
  role: UserRole;
  title: string;
  description: string;
  name?: string;
  onSignOut: () => void;
  children: ReactNode;
};

export function DashboardShell({ role, title, description, name, onSignOut, children }: DashboardShellProps) {
  return (
    <main className="bl-dashboard-screen">
      <header className="bl-dashboard-topbar">
        <Link href="/" className="bl-dashboard-brand"><span><Leaf size={17} aria-hidden="true" /></span> BioLoop</Link>
        <div className="bl-dashboard-user"><span>{roleLabel[role]}</span><strong>{name || 'Mitra BioLoop'}</strong><button type="button" onClick={onSignOut} aria-label="Keluar dari akun"><LogOut size={17} aria-hidden="true" /></button></div>
      </header>
      <section className="bl-dashboard-intro">
        <div><p className="bl-dashboard-role">{roleLabel[role]}</p><h1>{title}</h1><p>{description}</p></div>
        <Link href="/" className="bl-dashboard-back"><ArrowLeft size={16} aria-hidden="true" /> Beranda</Link>
      </section>
      <section className="bl-dashboard-content">{children}</section>
    </main>
  );
}

export function DashboardNotice({ children }: { children: ReactNode }) {
  return <div className="bl-dashboard-notice">{children}</div>;
}
