/* BioLoop admin dashboard — an operational overview focused on real listings and the points where follow-up is needed. */
'use client';

import { useEffect, useState } from 'react';
import { Activity, Building2, ClipboardCheck, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardNotice, DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Listing = { id: string; waste_type: string; weight_kg: number; location_name: string; status: string; created_at: string };
const statusCopy: Record<string, string> = { available: 'Menunggu pengolah', pending: 'Menunggu pengolah', claimed: 'Sudah diklaim', in_transit: 'Dalam perjalanan', completed: 'Selesai' };

export default function AdminDashboard() {
  const router = useRouter(); const [profile, setProfile] = useState<any>(null); const [listings, setListings] = useState<Listing[]>([]); const [partnerCount, setPartnerCount] = useState(0); const [isLoading, setIsLoading] = useState(true); const [message, setMessage] = useState('');
  useEffect(() => { async function initialise() { try { const userProfile = await getCurrentUserProfile(); if (!userProfile || userProfile.role !== 'admin') return router.replace('/dashboard'); setProfile(userProfile); const [listingResult, profileResult] = await Promise.all([supabase.from('waste_listings').select('*').order('created_at', { ascending: false }), supabase.from('profiles').select('*', { count: 'exact', head: true })]); if (listingResult.error) setMessage(listingResult.error.message); else setListings(listingResult.data || []); if (!profileResult.error) setPartnerCount(profileResult.count || 0); } catch { router.replace('/login'); } finally { setIsLoading(false); } } initialise(); }, [router]);
  if (isLoading) return <main className="bl-dashboard-loading">Menyiapkan dashboard tim BioLoop…</main>;
  return <DashboardShell role="admin" title="Lihat alur operasional dari satu tempat." description="Tinjau volume listing, kondisi perjalanan, dan area yang perlu ditindaklanjuti oleh tim BioLoop." name={profile?.full_name} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <div className="bl-dashboard-stats"><article><Building2 size={19} /><span>Mitra terdaftar</span><strong>{partnerCount}</strong></article><article><ClipboardCheck size={19} /><span>Listing terbuka</span><strong>{listings.filter((item) => ['available', 'pending'].includes(item.status)).length}</strong></article><article><Activity size={19} /><span>Dalam proses</span><strong>{listings.filter((item) => ['claimed', 'in_transit'].includes(item.status)).length}</strong></article></div>
    <section className="bl-panel"><div className="bl-panel-heading"><span className="bl-panel-icon"><UsersRound size={18} /></span><div><h2>Aktivitas terbaru</h2><p>Daftar pergerakan yang masuk ke sistem, diurutkan dari yang paling baru.</p></div></div>{message && <DashboardNotice>{message}</DashboardNotice>}<div className="bl-operation-list">{listings.length ? listings.slice(0, 10).map((item) => <article className="bl-operation-row" key={item.id}><div><strong>{item.waste_type}</strong><p>{item.location_name || 'Lokasi belum dicantumkan'} · {Number(item.weight_kg).toLocaleString('id-ID')} kg</p></div><span className={`bl-status bl-status-${item.status}`}>{statusCopy[item.status] || item.status}</span></article>) : <p className="bl-empty-state">Belum ada aktivitas listing yang dapat ditinjau.</p>}</div></section>
  </DashboardShell>;
}
