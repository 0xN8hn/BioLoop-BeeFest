'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { OrderCard } from '@/components/marketplace-components';
import { Button } from '@/components/ui/button';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ProducerOrdersPage() {
  const router = useRouter(); const [profile, setProfile] = useState<any>(null); const [orders, setOrders] = useState<any[]>([]); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState('');
  useEffect(() => { (async () => { try { const currentProfile = await getCurrentUserProfile(); if (!currentProfile || currentProfile.role !== 'producer') return router.replace('/dashboard'); setProfile(currentProfile); const { data, error } = await supabase.from('marketplace_orders').select('*,waste_listings(waste_type,location_name,weight_kg)').eq('producer_id', currentProfile.id).order('created_at', { ascending: false }); if (error) setMessage(error.message); else setOrders(data || []); } catch { router.replace('/login'); } finally { setLoading(false); } })(); }, [router]);
  async function markReady(order: any) { setSaving(order.id); const { error } = await supabase.from('marketplace_orders').update({ fulfillment_status: 'ready_for_pickup' }).eq('id', order.id).eq('producer_id', profile.id); setSaving(''); if (error) return setMessage(error.message); await supabase.from('order_timeline').insert({ order_id: order.id, status: 'ready_for_pickup', title: 'Material siap dijemput', detail: 'Seller menandai material siap diserahkan sesuai jam pickup.', actor_id: profile.id }); setOrders((value) => value.map((item) => item.id === order.id ? { ...item, fulfillment_status: 'ready_for_pickup' } : item)); }
  if (loading) return <main className="work-loading">Memuat pesanan…</main>;
  return <DashboardShell role="producer" name={profile?.full_name || profile?.name} points={Number(profile?.total_points ?? profile?.points ?? 0)} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}><main className="market-page seller-orders-page"><header className="seller-head"><div><p className="work-kicker">SELLER CENTER · PESANAN</p><h2>Siapkan material sebelum pickup.</h2><p>Setiap order mencatat buyer, nilai material, logistik pilihan, dan status berat akhir di halaman pelacakan.</p></div></header>{message && <p className="work-form-error">{message}</p>}<section className="seller-order-list">{orders.map((order) => <OrderCard key={order.id} order={order} href={`/tracking/${order.id}`} action={order.fulfillment_status === 'awaiting_payment' || order.fulfillment_status === 'pending_verification' ? <Button size="sm" onClick={() => markReady(order)} disabled={saving === order.id}>{saving === order.id ? 'Menyimpan…' : <><PackageCheck size={14} /> Siap dijemput</>}</Button> : undefined} />)}{!orders.length && <p className="market-empty">Belum ada order masuk. Produk Anda akan muncul di sini setelah buyer melakukan checkout.</p>}</section></main></DashboardShell>;
}
