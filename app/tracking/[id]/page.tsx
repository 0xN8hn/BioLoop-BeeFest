'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface OrderItem {
  id: string;
  waste_type: string;
  weight_kg: number;
  location_name: string;
  status: string;
  created_at: string;
  claimed_by?: string;
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params untuk Next.js 15 / App Router
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. Fetch Data Awal & Subskripsi Supabase Realtime (WebSocket)
  useEffect(() => {
    async function fetchInitialOrder() {
      setLoading(true);
      const { data, error } = await supabase
        .from('waste_listings')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) console.error('Error fetching order:', error.message);
      else setOrder(data);
      setLoading(false);
    }

    fetchInitialOrder();

    // Jalankan WebSocket Listener
    const channel = supabase
      .channel(`tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'waste_listings',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          // Ketika ada perubahan status di database, UI langsung ter-update secara instan
          setOrder(payload.new as OrderItem);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Fungsi Tambah Poin & History
  const addPointsToUser = async (userId: string, weight: number) => {
    const pointsEarned = Math.floor(weight * 10); // 1kg = 10 poin
    
    // 1. Ambil data profil user saat ini untuk hitung tier
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userProfile) {
      const newTotalPoints = (userProfile.total_points || 0) + pointsEarned;
      
      // Logika Tier Otomatis
      let newTier = userProfile.member_tier || 'Bronze';
      if (newTotalPoints >= 1000) newTier = 'Platinum';
      else if (newTotalPoints >= 500) newTier = 'Gold';
      else if (newTotalPoints >= 200) newTier = 'Silver';

      // Update total_points dan member_tier di profiles
      await supabase
        .from('profiles')
        .update({ 
          total_points: newTotalPoints,
          member_tier: newTier 
        })
        .eq('id', userId);
    }
    
    // 2. Simpan ke history (jika tabel point_history ada)
    await supabase.from('point_history').insert({
      user_id: userId,
      amount: pointsEarned,
      description: `Penjemputan sampah ${weight}kg`
    }).select();
  };

  // 2. Handler untuk Mengubah Status & Memicu Poin saat Completed
  const handleUpdateStatus = async (nextStatus: string) => {
    setUpdating(true);

    // 1. Update status di database tabel waste_listings
    const { error } = await supabase
      .from('waste_listings')
      .update({ status: nextStatus })
      .eq('id', orderId);

    if (error) {
      alert('Gagal mengupdate status: ' + error.message);
      setUpdating(false);
      return;
    }

    // 2. Jika status berubah menjadi 'completed', tambahkan poin ke user yang login
    if (nextStatus === 'completed' && order) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await addPointsToUser(user.id, order.weight_kg);
        const earned = Math.floor(order.weight_kg * 10);
        alert(`🎉 Pesanan Selesai! Anda mendapatkan +${earned} Poin.`);
      }
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Memuat data lacak pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-700 font-bold text-lg">Pesanan Tidak Ditemukan</p>
        <Link href="/" className="mt-4 text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // Definisi Alur Status Stepper ala Shopee / Gojek
  const steps = [
    { key: 'available', title: 'Listing Dibuat', desc: 'Menunggu Pengolah/Kurir' },
    { key: 'claimed', title: 'Penjemputan Dijadwalkan', desc: 'Mitra telah menerima order' },
    { key: 'in_transit', title: 'Dalam Perjalanan', desc: 'Kurir sedang menjemput limbah' },
    { key: 'completed', title: 'Selesai Didaur Ulang', desc: 'Limbah telah diterima di fasilitas' },
  ];

  // Cari posisi step saat ini
  let currentStepIndex = steps.findIndex((s) => s.key === order.status);
  if (currentStepIndex === -1) currentStepIndex = 0; // Fallback ke step 0

  const carbonSaved = (order.weight_kg * 2.5).toFixed(1);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* NAVIGASI KEMBALI */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
        >
          ← Kembali ke Dashboard
        </Link>

        {/* CARD UTAMA TRACKING */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                Real-time Tracking
              </span>
              <h1 className="text-xl font-bold text-gray-800 mt-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-xs text-gray-500">
                Waktu Pembuatan: {new Date(order.created_at).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Total Volume</span>
              <span className="text-lg font-extrabold text-emerald-700">{order.weight_kg} kg</span>
            </div>
          </div>

          {/* STEPPER PROGRESS BAR (ALA GOJEK / SHOPEE) */}
          <div className="py-4">
            <div className="relative">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex items-start mb-8 last:mb-0 relative">
                    {/* Garis Penghubung antar Step */}
                    {idx !== steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-full -ml-[1px] ${
                          idx < currentStepIndex ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Bulatan Step Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 border border-gray-300'
                      } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                    >
                      {idx + 1}
                    </div>

                    {/* Deskripsi Step */}
                    <div className="ml-4">
                      <h3
                        className={`text-sm font-bold ${
                          isPassed ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INFORMASI DETAIL LOKASI & ESG */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Lokasi Penjemputan:</span>
              <span className="font-semibold text-gray-800">{order.location_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Kategori Limbah:</span>
              <span className="font-semibold text-gray-800">{order.waste_type}</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-emerald-200/60">
              <span className="text-emerald-800 font-medium">🌱 Estimasi Reduksi Emisi CO₂e:</span>
              <span className="font-bold text-emerald-800">{carbonSaved} kg CO₂e</span>
            </div>
          </div>

          {/* PANEL KONTROL UTAMA: SIMULASI AKSI PERUBAHAN STATUS */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600">
              🛠️ Panel Aksi Operasional (Simulasi Perubahan Status Real-Time):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={updating || order.status === 'claimed'}
                onClick={() => handleUpdateStatus('claimed')}
                className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs py-2 rounded-lg font-medium transition disabled:opacity-40"
              >
                1. Terima Order
              </button>
              <button
                disabled={updating || order.status === 'in_transit'}
                onClick={() => handleUpdateStatus('in_transit')}
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs py-2 rounded-lg font-medium transition disabled:opacity-40"
              >
                2. Jemput Sampah
              </button>
              <button
                disabled={updating || order.status === 'completed'}
                onClick={() => handleUpdateStatus('completed')}
                className="bg-gray-800 text-white hover:bg-gray-900 text-xs py-2 rounded-lg font-medium transition disabled:opacity-40"
              >
                3. Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}