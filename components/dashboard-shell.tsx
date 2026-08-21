/* BioLoop workspace shell — shadcn primitives, real brand mark, and intentionally asymmetric app navigation. */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Award, Bell, ClipboardList, LayoutDashboard, LogOut, Map, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';
import { roleLabel } from '@/lib/roles';
import { Button } from '@/components/ui/button';

type ShellProps = { role: UserRole; name?: string; points?: number; onSignOut: () => void; children: ReactNode };
const nav = [{ label: 'Ringkasan', icon: LayoutDashboard, href: '#ringkasan' }, { label: 'Peta operasi', icon: Map, href: '#peta' }, { label: 'Riwayat', icon: ClipboardList, href: '#riwayat' }, { label: 'Poin', icon: Award, href: '#poin' }];
export function DashboardShell({ role, name, points = 0, onSignOut, children }: ShellProps) { const initial = (name || 'B').trim().slice(0, 1).toUpperCase(); return <div className="work-app"><aside className="work-rail"><Link href="/" className="work-brand"><Image src="/bioloop/logo-mark.png" width={36} height={36} alt="BioLoop" priority /><span>BioLoop</span></Link><div className="work-identity"><span>{roleLabel[role]}</span><strong>{name || 'Mitra BioLoop'}</strong></div><nav>{nav.map(({ label, icon: Icon, href }, index) => <a key={label} href={href} className={index === 0 ? 'active' : ''}><Icon size={17} /><span>{label}</span></a>)}</nav><div className="work-rail-foot"><Button variant="ghost" size="sm" onClick={() => undefined}><Settings2 size={16} /> Pengaturan</Button><Button variant="ghost" size="sm" className="work-logout" onClick={onSignOut}><LogOut size={16} /> Keluar</Button></div></aside><main className="work-main"><header className="work-top"><div><p>{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p><h1>{roleLabel[role]}</h1></div><div className="work-top-actions"><Button variant="outline" size="icon" aria-label="Notifikasi"><Bell size={17} /></Button><a className="work-points" href="#poin"><Award size={16} /><b>{points.toLocaleString('id-ID')}</b><span>poin</span></a><div className="work-avatar">{initial}</div></div></header>{children}</main><nav className="work-mobile-nav">{nav.map(({ label, icon: Icon, href }, index) => <a key={label} href={href} className={index === 0 ? 'active' : ''}><Icon size={18} /><span>{label}</span></a>)}</nav></div>; }

export function StatusPill({ status }: { status: string }) { const labels: Record<string, string> = { available: 'Tersedia', pending: 'Menunggu', claimed: 'Diklaim', in_transit: 'Dalam rute', completed: 'Selesai' }; return <span className={`work-status work-status-${status}`}>{labels[status] || status}</span>; }
