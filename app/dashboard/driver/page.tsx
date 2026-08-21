/* BioLoop driver dashboard — a simple route board for collection and completion states. */
'use client';

import { useEffect, useState } from 'react';
import { CheckCheck, MapPin, Route, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardNotice, DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Listing = { id: string; waste_type: string; weight_kg: number; location_name: string; status: string };
const statusLabel: Record<string, string> = { claimed: 'Siap diambil', in_transit: 'Dalam perjalanan', completed: 'Selesai' };

export default function DriverDashboard() {
  const router = useRouter(); const [profile, setProfile] = useState<any>(null); const [jobs, setJobs] = useState<Listing[]>([]); const [isLoading, setIsLoading] = useState(true); const [message, setMessage] = useState(''); const [updatingId, setUpdatingId] = useState<string | null>(null);
  async function loadJobs() { const { data, error } = await supabase.from('waste_listings').select('*').in('status', ['claimed', 'in_transit']).order('created_at', { ascending: true }); if (error) setMessage(error.message); else setJobs(data || []); }
  useEffect(() => { async function initialise() { try { const userProfile = await getCurrentUserProfile(); if (!userProfile || userProfile.role !== 'driver') return router.replace('/dashboard'); setProfile(userProfile); await loadJobs(); } catch { router.replace('/login'); } finally { setIsLoading(false); } } initialise(); }, [router]);
  async function advanceJob(job: Listing) { const nextStatus = job.status === 'claimed' ? 'in_transit' : 'completed'; setUpdatingId(job.id); const { error } = await supabase.from('waste_listings').update({ status: nextStatus }).eq('id', job.id); setUpdatingId(null); if (error) setMessage(error.message); else { setMessage(nextStatus === 'completed' ? 'Penjemputan ditandai selesai.' : 'Status diperbarui menjadi dalam perjalanan.'); await loadJobs(); } }
  if (isLoading) return <main className="bl-dashboard-loading">Menyiapkan dashboard logistik…</main>;
  return <DashboardShell role="driver" title="Jaga setiap penjemputan tetap bergerak." description="Lihat penjemputan yang sudah diklaim pengolah, lalu perbarui status saat barang berpindah tangan." name={profile?.full_name} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <div className="bl-dashboard-stats"><article><Truck size={19} /><span>Siap diambil</span><strong>{jobs.filter((job) => job.status === 'claimed').length}</strong></article><article><Route size={19} /><span>Dalam perjalanan</span><strong>{jobs.filter((job) => job.status === 'in_transit').length}</strong></article><article><CheckCheck size={19} /><span>Pekerjaan aktif</span><strong>{jobs.length}</strong></article></div>
    <section className="bl-panel"><div className="bl-panel-heading"><span className="bl-panel-icon"><Truck size={18} /></span><div><h2>Daftar penjemputan</h2><p>Prioritaskan listing yang telah diklaim dan siap dipindahkan ke pengolah.</p></div></div>{message && <DashboardNotice>{message}</DashboardNotice>}<div className="bl-operation-list">{jobs.length ? jobs.map((job) => <article className="bl-opportunity-row" key={job.id}><div className="bl-opportunity-main"><p className={`bl-status bl-status-${job.status}`}>{statusLabel[job.status]}</p><h3>{job.waste_type}</h3><p><MapPin size={14} /> {job.location_name || 'Lokasi belum dicantumkan'} · {Number(job.weight_kg).toLocaleString('id-ID')} kg</p></div><div className="bl-opportunity-meta"><button type="button" className="bl-operation-button" disabled={updatingId === job.id} onClick={() => advanceJob(job)}>{updatingId === job.id ? 'Memperbarui…' : job.status === 'claimed' ? 'Mulai pengantaran' : 'Tandai selesai'}</button></div></article>) : <p className="bl-empty-state">Belum ada penjemputan aktif. Listing akan muncul setelah diklaim pengolah.</p>}</div></section>
  </DashboardShell>;
}
