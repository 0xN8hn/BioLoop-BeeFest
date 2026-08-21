'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RecyclerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function initPage() {
      try {
        const userProfile = await getCurrentUserProfile();
        if (!userProfile) {
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
    const { data } = await supabase.from('waste_listings').select('*').order('created_at', { ascending: false });
    setListings(data || []);
    setLoadingData(false);
  };

  const handleClaimListing = async (id: string, weightKg: number) => {
    const earnedPoints = Math.round(weightKg * 10);
    const { error: updateError } = await supabase.from('waste_listings').update({ status: 'claimed' }).eq('id', id);
    if (updateError) { alert('Gagal klaim: ' + updateError.message); return; }

    if (profile?.id) {
      const newTotalPoints = (profile.total_points || 0) + earnedPoints;
      await supabase.from('profiles').update({ total_points: newTotalPoints }).eq('id', profile.id);
      setProfile({ ...profile, total_points: newTotalPoints });
    }
    alert(`Berhasil diklaim! Mendapat +${earnedPoints} Poin.`);
    fetchListings();
  };

  if (loadingUser) return <div className="min-h-screen flex items-center justify-center">Memuat dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-700">Dashboard Pengolah (Recycler)</h1>
            <p className="text-sm text-gray-500">Poin Anda: <span className="font-bold text-emerald-600">{profile?.total_points || 0} pts</span></p>
          </div>
          <button onClick={() => { signOutUser(); router.push('/login'); }} className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">Logout</button>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">🪱 Feed Pasokan Limbah Siap Klaim</h2>
            <button onClick={fetchListings} className="text-xs text-emerald-600">Refresh</button>
          </div>
          {loadingData ? <p className="text-sm text-gray-500">Memuat data...</p> : listings.length === 0 ? <p className="text-sm text-gray-400">Belum ada pasokan.</p> : (
            <div className="space-y-3">
              {listings.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border flex justify-between items-center bg-white">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.waste_type}</h3>
                    <p className="text-xs text-gray-500">📍 {item.location_name} • ⚖️ {item.weight_kg} kg</p>
                  </div>
                  {item.status === 'available' && (
                    <button onClick={() => handleClaimListing(item.id, item.weight_kg)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                      Klaim Logistik
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}