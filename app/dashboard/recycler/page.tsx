/* BioLoop recycler dashboard — a focused pickup feed for BSF processors, with no synthetic operational metrics. */
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin, Scale, Sprout } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardNotice, DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Listing = { id: string; waste_type: string; weight_kg: number; location_name: string; status: string; created_at: string };

export default function RecyclerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function loadListings() { const { data, error } = await supabase.from('waste_listings').select('*').in('status', ['available', 'pending']).order('created_at', { ascending: false }); if (error) setMessage(error.message); else setListings(data || []); }
  useEffect(() => { async function initialise() { try { const userProfile = await getCurrentUserProfile(); if (!userProfile || userProfile.role !== 'recycler') return router.replace('/dashboard'); setProfile(userProfile); await loadListings(); } catch { router.replace('/login'); } finally { setIsLoading(false); } } initialise(); }, [router]);
  async function claimListing(id: string) {
    if (!profile?.id) return setMessage('Profil pengolah belum tersedia. Logout lalu masuk kembali.');
    setClaimingId(id); setMessage('');
    const { data: claimedListing, error } = await supabase
      .from('waste_listings')
      .update({ status: 'claimed', processor_id: profile.id })
      .eq('id', id)
      .in('status', ['available', 'pending'])
      .select('*')
      .single();
    setClaimingId(null);
    if (error) return setMessage(error.message);
    if (!claimedListing) return setMessage('Klaim tidak mengembalikan data. Periksa policy UPDATE recycler di Supabase.');
    setListings((current) => current.filter((listing) => listing.id !== claimedListing.id));
    setMessage('Listing diklaim. Koordinasikan pengambilan dengan sumber sisa organik.');
  }
  if (isLoading) return <main className="bl-dashboard-loading">Menyiapkan dashboard pengolah…</main>;

  const availableKg = listings.reduce((total, item) => total + Number(item.weight_kg || 0), 0);
  return <DashboardShell role="recycler" title="Temukan bahan organik yang siap diolah." description="Lihat sumber yang tersedia, nilai kesesuaiannya, lalu klaim saat kapasitas pengolahan Anda memungkinkan." name={profile?.full_name} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <div className="bl-dashboard-stats"><article><Sprout size={19} /><span>Sumber tersedia</span><strong>{listings.length}</strong></article><article><Scale size={19} /><span>Potensi bahan</span><strong>{availableKg.toLocaleString('id-ID')}<small> kg</small></strong></article><article><CheckCircle2 size={19} /><span>Siap diklaim</span><strong>{listings.filter((item) => item.status === 'available').length}</strong></article></div>
    <section className="bl-panel"><div className="bl-panel-heading"><span className="bl-panel-icon"><Sprout size={18} /></span><div><h2>Feed bahan organik</h2><p>Hanya tampilkan listing yang masih terbuka untuk pengolahan.</p></div></div>{message && <DashboardNotice>{message}</DashboardNotice>}<div className="bl-operation-list">{listings.length ? listings.map((item) => <article className="bl-opportunity-row" key={item.id}><div className="bl-opportunity-main"><p className="bl-status bl-status-available">Tersedia</p><h3>{item.waste_type}</h3><p><MapPin size={14} /> {item.location_name || 'Lokasi belum dicantumkan'}</p></div><div className="bl-opportunity-meta"><strong>{Number(item.weight_kg).toLocaleString('id-ID')}<small> kg</small></strong><button type="button" className="bl-operation-button" disabled={claimingId === item.id} onClick={() => claimListing(item.id)}>{claimingId === item.id ? 'Mengklaim…' : 'Klaim bahan'}</button></div></article>) : <p className="bl-empty-state">Belum ada bahan organik yang tersedia saat ini. Cek kembali setelah produsen menambahkan listing baru.</p>}</div></section>
  </DashboardShell>;
}
