'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletCards } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/marketplace';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ProducerPayoutsPage() {
  const router = useRouter(); const [profile, setProfile] = useState<any>(null); const [payouts, setPayouts] = useState<any[]>([]); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const currentProfile = await getCurrentUserProfile(); if (!currentProfile || currentProfile.role !== 'producer') return router.replace('/dashboard'); setProfile(currentProfile); const { data, error } = await supabase.from('payouts').select('*').eq('recipient_id', currentProfile.id).order('created_at', { ascending: false }); if (error) setMessage(error.message); else setPayouts(data || []); } catch { router.replace('/login'); } finally { setLoading(false); } })(); }, [router]);
  const summary = useMemo(() => ({ pending: payouts.filter((item) => item.status !== 'paid').reduce((total, item) => total + Number(item.amount || 0), 0), paid: payouts.filter((item) => item.status === 'paid').reduce((total, item) => total + Number(item.amount || 0), 0) }), [payouts]);
  if (loading) return <main className="work-loading">Memuat keuangan…</main>;
  return <DashboardShell role="producer" name={profile?.full_name || profile?.name} points={Number(profile?.total_points ?? profile?.points ?? 0)} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}><main className="market-page"><header className="seller-head"><div><p className="work-kicker">SELLER CENTER · KEUANGAN</p><h2>Payout dari order yang sudah diselesaikan.</h2><p>Jumlah di bawah hanya menampilkan catatan payout yang telah dibuat oleh proses transaksi.</p></div></header>{message && <p className="work-form-error">{message}</p>}<section className="seller-finance-grid"><Card><CardHeader><div><CardTitle>Menunggu proses</CardTitle><p>Payout yang belum dibayarkan.</p></div><WalletCards size={18} className="work-card-icon" /></CardHeader><CardContent><b className="seller-finance-value">{formatRupiah(summary.pending)}</b></CardContent></Card><Card><CardHeader><div><CardTitle>Sudah dibayarkan</CardTitle><p>Riwayat payout berstatus dibayarkan.</p></div><WalletCards size={18} className="work-card-icon" /></CardHeader><CardContent><b className="seller-finance-value">{formatRupiah(summary.paid)}</b></CardContent></Card></section><section className="seller-recent"><div className="seller-section-title"><div><h3>Riwayat payout</h3><p>Transparan dan terpisah dari harga material.</p></div></div>{payouts.length ? <div className="market-rows">{payouts.map((payout) => <article key={payout.id}><div><strong>{formatRupiah(Number(payout.amount || 0))}</strong><p>{new Date(payout.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><b>{payout.status}</b></article>)}</div> : <p className="market-empty">Belum ada payout. Catatan akan muncul setelah order memenuhi tahap penyelesaian.</p>}</section></main></DashboardShell>;
}
