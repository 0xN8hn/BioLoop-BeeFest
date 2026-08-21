/* Field Operations Console — compact navigation, live operational state, and no landing-page hero treatment. */
'use client';

import Link from 'next/link';
import { Award, Bell, CircleHelp, Leaf, LayoutDashboard, ListChecks, LogOut, MapPinned, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';
import { roleLabel } from '@/lib/roles';

type ShellProps = { role: UserRole; name?: string; points?: number; onSignOut: () => void; children: ReactNode };
const navItems = [{ label: 'Ringkasan', icon: LayoutDashboard, href: '#ringkasan' }, { label: 'Peta', icon: MapPinned, href: '#peta' }, { label: 'Aktivitas', icon: ListChecks, href: '#aktivitas' }, { label: 'Poin', icon: Award, href: '#poin' }];

export function DashboardShell({ role, name, points = 0, onSignOut, children }: ShellProps) {
  const date = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  return <main className="ops-app"><aside className="ops-sidebar"><Link href="/" className="ops-brand"><span><Leaf size={17} /></span><strong>BioLoop</strong></Link><p className="ops-role">{roleLabel[role]}</p><nav className="ops-nav">{navItems.map(({ label, icon: Icon, href }, index) => <a href={href} key={label} className={index === 0 ? 'is-active' : ''}><Icon size={18} /><span>{label}</span></a>)}</nav><div className="ops-sidebar-bottom"><a href="#" onClick={(event) => event.preventDefault()}><CircleHelp size={17} /><span>Bantuan</span></a><a href="#" onClick={(event) => event.preventDefault()}><Settings size={17} /><span>Pengaturan</span></a><button type="button" onClick={onSignOut}><LogOut size={17} /><span>Keluar</span></button></div></aside><section className="ops-main"><header className="ops-topbar"><div><p className="ops-topbar-date">{date}</p><h1>{name || 'Mitra BioLoop'}</h1></div><div className="ops-topbar-actions"><button className="ops-icon-button" aria-label="Notifikasi"><Bell size={18} /></button><div className="ops-points"><Award size={17} /><span>{points.toLocaleString('id-ID')} <small>poin</small></span></div><div className="ops-avatar">{(name || 'B').slice(0, 1).toUpperCase()}</div></div></header><section className="ops-content">{children}</section></section><nav className="ops-mobile-nav">{navItems.map(({ label, icon: Icon, href }, index) => <a href={href} key={label} className={index === 0 ? 'is-active' : ''}><Icon size={18} /><span>{label}</span></a>)}</nav></main>;
}

export function OpsMetric({ label, value, tone = 'ink', note }: { label: string; value: string | number; tone?: 'ink' | 'clay' | 'amber' | 'sage'; note?: string }) { return <article className={`ops-metric ops-metric-${tone}`}><p>{label}</p><strong>{value}</strong>{note && <span>{note}</span>}</article>; }
export function OpsPanel({ id, title, action, children }: { id?: string; title: string; action?: ReactNode; children: ReactNode }) { return <section className="ops-panel" id={id}><header><h2>{title}</h2>{action}</header>{children}</section>; }
export function DashboardNotice({ children }: { children: ReactNode }) { return <div className="ops-notice">{children}</div>; }
export function StatusPill({ status }: { status: string }) { const label: Record<string, string> = { available: 'Tersedia', pending: 'Menunggu', claimed: 'Diklaim', in_transit: 'Dalam jalan', completed: 'Selesai' }; return <span className={`ops-status ops-status-${status}`}>{label[status] || status}</span>; }
