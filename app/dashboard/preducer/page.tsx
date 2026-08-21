'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { generateEsgCertificate } from '@/lib/pdf';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

export default function ProducerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // State Form Input Restoran
  const [wasteType, setWasteType] = useState('Sisa Dapur / Makanan Basi');
  const [weight, setWeight] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function initPage() {
      try {
        const userProfile = await getCurrentUserProfile();
        if (!userProfile || userProfile.role !== 'producer') {
          router.push('/login');
          return;
        }
        setProfile(userProfile);
        fetchListings();
      } catch (err) {
        router.push('/login');
      } finally {
        setLoadingUser(false);
      }
    }
    initPage();
  }, [router]);

  const fetchListings = async () => {
    setLoadingData(true);
    const { data } = await supabase
      .from('waste_listings')
      .select('*')
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoadingData(false);
  };

  const InteractiveMap = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-400">Memuat Peta...</div>,
  });

  const totalWasteProcessed = listings.filter((i) => i.status !== 'available').reduce((acc, curr) => acc + Number(curr.weight_kg), 0);
  const totalCarbonSaved = (totalWasteProcessed * 2.5).toFixed(1);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !locationName) return alert('Mohon isi semua field!');
    setIsSubmitting(true);
    const { error } = await supabase.from('waste_listings').insert([
      { waste_type: wasteType, weight_kg: parseFloat(weight), location_name: locationName, status: 'available' },
    ]);
    setIsSubmitting(false);
    if (error) alert('Gagal menambah data: ' + error.message);
    else { setWeight(''); setLocationName(''); fetchListings(); }
  };

  if (loadingUser) return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-700">Dashboard Produsen (Restoran)</h1>
            <p className="text-sm text-gray-500">Mitra: {profile?.full_name}</p>
          </div>
          <button onClick={() => { signOutUser(); router.push('/login'); }} className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">Logout</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Input Limbah */}
          <section className="bg-white p-6 rounded-xl shadow-sm border h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🥑 Input Limbah Baru</h2>
            <form onSubmit={handleAddListing} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Limbah</label>
                <select value={wasteType} onChange={(e) => setWasteType(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                  <option>Sisa Dapur / Makanan Basi</option>
                  <option>Kulit Buah & Sayuran</option>
                  <option>Limbah Olahan Daging/Ikan</option>
                  <option>Ampas Tahu / Kelapa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimasi Berat (kg)</label>
                <input type="number" placeholder="Contoh: 50" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi Penjemputan</label>
                <input type="text" placeholder="Nama Restoran / Cabang" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm">
                {isSubmitting ? 'Menyimpan...' : 'Post Jadwal Penjemputan'}
              </button>
            </form>
          </section>

          {/* Peta & Feed */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-bold text-gray-800 mb-2">🗺️ Peta Sebaran</h2>
              <InteractiveMap locations={listings} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}