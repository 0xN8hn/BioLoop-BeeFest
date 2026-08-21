/* BioLoop producer dashboard — one clear workflow: publish organic material and follow each pickup. */
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, ClipboardList, Plus, Scale, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardNotice, DashboardShell } from '@/components/dashboard-shell';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type Listing = { id: string; waste_type: string; weight_kg: number; location_name: string; status: string; created_at: string };
const statusCopy: Record<string, string> = { available: 'Menunggu pengolah', pending: 'Menunggu pengolah', claimed: 'Sudah diklaim', in_transit: 'Dalam perjalanan', completed: 'Selesai' };

export default function ProducerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [wasteType, setWasteType] = useState('Sisa dapur dan makanan siap olah');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');

  async function loadListings() {
    const { data, error } = await supabase.from('waste_listings').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message);
    else setListings(data || []);
  }

  useEffect(() => {
    async function initialise() {
      try {
        const userProfile = await getCurrentUserProfile();
        if (!userProfile || userProfile.role !== 'producer') return router.replace('/dashboard');
        setProfile(userProfile);
        await loadListings();
      } catch { router.replace('/login'); }
      finally { setIsLoading(false); }
    }
    initialise();
  }, [router]);

  async function addListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!weight || !location) return setMessage('Lengkapi berat dan lokasi penjemputan terlebih dahulu.');
    setIsSaving(true); setMessage('');
    let verifiedProfile = profile;
    try {
      verifiedProfile = await getCurrentUserProfile();
    } catch (error) {
      setIsSaving(false);
      return setMessage(error instanceof Error ? error.message : 'Profil produsen belum siap. Silakan masuk kembali terlebih dahulu.');
    }
    if (!verifiedProfile?.id) {
      setIsSaving(false);
      return setMessage('Profil produsen belum ditemukan. Silakan masuk kembali terlebih dahulu.');
    }
    setProfile(verifiedProfile);
    const { error } = await supabase.from('waste_listings').insert({ producer_id: verifiedProfile.id, waste_type: wasteType, weight_kg: Number(weight), location_name: location, status: 'available' });
    setIsSaving(false);
    if (error) return setMessage(error.message);
    setWeight(''); setLocation(''); setMessage('Listing baru sudah siap dilihat mitra pengolah.'); await loadListings();
  }

  const open = listings.filter((item) => ['available', 'pending'].includes(item.status)).length;
  const completedKg = listings.filter((item) => item.status === 'completed').reduce((total, item) => total + Number(item.weight_kg || 0), 0);
  if (isLoading) return <main className="bl-dashboard-loading">Menyiapkan dashboard produsen…</main>;

  return <DashboardShell role="producer" title="Sisa dapur, bergerak ke rute berikutnya." description="Buat listing saat sisa organik siap dipisahkan. Pantau progresnya tanpa mengandalkan chat yang tercecer." name={profile?.full_name} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <div className="bl-dashboard-stats"><article><ClipboardList size={19} /><span>Listing aktif</span><strong>{open}</strong></article><article><Truck size={19} /><span>Sudah diklaim</span><strong>{listings.filter((item) => item.status === 'claimed').length}</strong></article><article><Scale size={19} /><span>Telah selesai diolah</span><strong>{completedKg.toLocaleString('id-ID')}<small> kg</small></strong></article></div>
    <div className="bl-dashboard-columns producer-layout"><section className="bl-panel bl-create-panel"><div className="bl-panel-heading"><span className="bl-panel-icon"><Plus size={18} /></span><div><h2>Listing penjemputan baru</h2><p>Masukkan detail yang diperlukan pengolah untuk merencanakan pengambilan.</p></div></div><form className="bl-operation-form" onSubmit={addListing}><label>Jenis sisa organik<select value={wasteType} onChange={(event) => setWasteType(event.target.value)}><option>Sisa dapur dan makanan siap olah</option><option>Kulit buah dan sayur</option><option>Ampas tahu atau kelapa</option><option>Sisa olahan daging dan ikan</option></select></label><label>Estimasi berat (kg)<input type="number" min="1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="Contoh: 25" /></label><label>Lokasi penjemputan<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Contoh: Dapur Sore, Cikini" /></label><button type="submit" className="bl-operation-button" disabled={isSaving}>{isSaving ? 'Menyimpan…' : 'Publikasikan listing'}</button></form>{message && <DashboardNotice>{message}</DashboardNotice>}</section>
    <section className="bl-panel"><div className="bl-panel-heading"><span className="bl-panel-icon"><Truck size={18} /></span><div><h2>Aktivitas penjemputan</h2><p>Status terkini dari listing yang Anda buat.</p></div></div><div className="bl-operation-list">{listings.length ? listings.map((item) => <article className="bl-operation-row" key={item.id}><div><strong>{item.waste_type}</strong><p>{item.location_name || 'Lokasi belum dicantumkan'} · {Number(item.weight_kg).toLocaleString('id-ID')} kg</p></div><span className={`bl-status bl-status-${item.status}`}>{statusCopy[item.status] || item.status}</span></article>) : <p className="bl-empty-state">Belum ada listing. Mulai dari satu sisa dapur yang sudah dipisahkan.</p>}</div></section></div>
  </DashboardShell>;
}
