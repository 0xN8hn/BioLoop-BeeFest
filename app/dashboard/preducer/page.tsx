'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, ClipboardCheck, PackagePlus, WalletCards } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardShell, StatusPill } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/marketplace';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SellerCenterPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [impactWeight, setImpactWeight] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const currentProfile = await getCurrentUserProfile();
        if (!currentProfile || currentProfile.role !== 'producer') return router.replace('/dashboard');
        setProfile(currentProfile);
        const [listingResult, orderResult, payoutResult, impactResult] = await Promise.all([
          supabase.from('waste_listings').select('*').eq('producer_id', currentProfile.id).order('created_at', { ascending: false }),
          supabase.from('marketplace_orders').select('*,waste_listings(waste_type,location_name)').eq('producer_id', currentProfile.id).order('created_at', { ascending: false }),
          supabase.from('payouts').select('*').eq('recipient_id', currentProfile.id).order('created_at', { ascending: false }),
          supabase.from('order_impacts').select('processed_weight_kg').eq('producer_id', currentProfile.id),
        ]);
        const firstError = listingResult.error || orderResult.error || payoutResult.error || impactResult.error;
        if (firstError) setMessage(firstError.message);
        setListings(listingResult.data || []);
        setOrders(orderResult.data || []);
        setPayouts(payoutResult.data || []);
        setImpactWeight((impactResult.data || []).reduce((total, item) => total + Number(item.processed_weight_kg || 0), 0));
      } catch { router.replace('/login'); } finally { setLoading(false); }
    })();
  }, [router]);

  const weeklyOrders = useMemo(() => {
    const buckets = new Map<string, number>();
    orders.forEach((order) => { const day = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(order.created_at)); buckets.set(day, (buckets.get(day) || 0) + 1); });
    return [...buckets.entries()].map(([day, jumlah]) => ({ day, jumlah }));
  }, [orders]);
  const activeListings = listings.filter((item) => ['available', 'pending'].includes(item.status)).length;
  const pendingOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.fulfillment_status)).length;
  const paidPayouts = payouts.filter((payout) => payout.status === 'paid').reduce((total, payout) => total + Number(payout.amount || 0), 0);

  if (loading) return <main className="work-loading">Memuat Seller Center…</main>;
  return <DashboardShell role="producer" name={profile?.full_name || profile?.name} points={Number(profile?.total_points ?? profile?.points ?? 0)} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <main className="market-page seller-page">
      <header className="seller-head"><div><p className="work-kicker">BIOLOOP SELLER CENTER</p><h2>Kelola material, pesanan, dan dampak bisnis Anda.</h2><p>Data di bawah berasal dari listing dan transaksi BioLoop yang tercatat pada akun Anda.</p></div><Button asChild><Link href="/dashboard/preducer/listings"><PackagePlus size={16} /> Tambah listing</Link></Button></header>
      {message && <p className="work-form-error">{message}</p>}
      <section className="seller-stat-grid"><article><span>Listing aktif</span><b>{activeListings}</b><small>Material yang dapat dibeli atau menunggu konfirmasi.</small><PackagePlus size={18} /></article><article><span>Pesanan berjalan</span><b>{pendingOrders}</b><small>Perlu disiapkan, dikirim, atau dikonfirmasi.</small><ClipboardCheck size={18} /></article><article><span>Payout dibayarkan</span><b>{formatRupiah(paidPayouts)}</b><small>Hanya mencakup payout berstatus dibayarkan.</small><WalletCards size={18} /></article><article><span>Material berhasil diolah</span><b>{impactWeight.toLocaleString('id-ID')} kg</b><small>Akumulasi transaksi yang selesai dan terukur.</small><BarChart3 size={18} /></article></section>
      <section className="seller-home-grid"><Card className="seller-chart-card"><CardHeader><div><CardTitle>Pesanan tercatat</CardTitle><p>Distribusi order aktual menurut hari pencatatan.</p></div></CardHeader><CardContent>{weeklyOrders.length ? <div className="seller-chart"><ResponsiveContainer width="100%" height={230}><BarChart data={weeklyOrders} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}><CartesianGrid stroke="#ebe5dd" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#887f76' }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#887f76' }} /><Tooltip cursor={{ fill: '#f6f2eb' }} contentStyle={{ border: '1px solid #e7e0d8', borderRadius: 0, fontSize: 11 }} /><Bar dataKey="jumlah" fill="#a95a42" radius={[1, 1, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="market-empty">Belum ada order untuk divisualisasikan.</p>}</CardContent></Card><Card className="seller-action-card"><CardHeader><div><CardTitle>Operasional hari ini</CardTitle><p>Jaga data katalog tetap akurat sebelum buyer melakukan checkout.</p></div></CardHeader><CardContent><div className="seller-action-list"><Link href="/dashboard/preducer/listings"><span>01</span><div><strong>Perbarui stok material</strong><p>Ubah berat, jam pickup, atau status listing bila diperlukan.</p></div></Link><Link href="/dashboard/preducer/orders"><span>02</span><div><strong>Tinjau pesanan masuk</strong><p>Siapkan material dan catat kesiapan pickup.</p></div></Link><Link href="/dashboard/preducer/green-certificate"><span>03</span><div><strong>Lihat dampak terukur</strong><p>Unduh ringkasan pengalihan material yang sudah selesai.</p></div></Link></div></CardContent></Card></section>
      <section className="seller-recent"><div className="seller-section-title"><div><h3>Listing terbaru</h3><p>Inventaris terbit dari akun Anda.</p></div><Link href="/dashboard/preducer/listings">Kelola produk</Link></div>{listings.length ? <div className="market-rows">{listings.slice(0, 5).map((listing) => <article key={listing.id}><div><strong>{listing.waste_type}</strong><p>{listing.location_name || 'Lokasi belum diisi'} · {Number(listing.weight_kg).toLocaleString('id-ID')} kg · {formatRupiah(Number(listing.price_per_kg || 0))}/kg</p></div><StatusPill status={listing.status} /></article>)}</div> : <p className="market-empty">Belum ada listing. Tambahkan material pertama Anda untuk mulai menerima pesanan.</p>}</section>
    </main>
  </DashboardShell>;
}
