'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocateFixed, Map, Search, SlidersHorizontal } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { MarketplaceMaterialCard } from '@/components/marketplace-components';
import { Button } from '@/components/ui/button';
import { getCurrentUserProfile, signOutUser } from '@/lib/auth';
import { haversineDistanceKm, nutrientProfiles, wasteCategories } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';

const InteractiveMap = dynamic(() => import('@/components/Map'), { ssr: false });
type Coordinates = { lat: number; lng: number };

export default function RecyclerMarketplacePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [nutrient, setNutrient] = useState('all');
  const [radius, setRadius] = useState(15);
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState('Aktifkan lokasi untuk filter radius.');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const currentProfile = await getCurrentUserProfile();
        if (!currentProfile || currentProfile.role !== 'recycler') return router.replace('/dashboard');
        setProfile(currentProfile);
        const { data, error } = await supabase.from('waste_listings').select('*').in('status', ['available', 'pending']).order('created_at', { ascending: false });
        if (error) setMessage(error.message); else setItems(data || []);
      } catch { router.replace('/login'); } finally { setLoading(false); }
    })();
  }, [router]);

  function requestLocation() {
    if (!navigator.geolocation) return setLocationState('Browser ini belum mendukung lokasi.');
    setLocationState('Mengambil lokasi Anda…');
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setLocationState('Radius disaring dari lokasi Anda.'); },
      () => setLocationState('Izin lokasi belum tersedia. Semua listing tetap ditampilkan.'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const shown = useMemo(() => {
    const max = Number(maxPrice || 0);
    const normalizedQuery = query.trim().toLowerCase();
    const result = items.map((item) => ({ ...item, distance_km: haversineDistanceKm(location, { lat: item.location_lat, lng: item.location_lng }) })).filter((item) => {
      const matchesText = !normalizedQuery || `${item.waste_type} ${item.location_name || ''} ${item.intended_use || ''}`.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === 'all' || item.category === category;
      const matchesNutrient = nutrient === 'all' || item.nutrient_profile === nutrient;
      const matchesPrice = !max || Number(item.price_per_kg || 0) <= max;
      const matchesRadius = !location || item.distance_km === null || item.distance_km <= radius;
      return matchesText && matchesCategory && matchesNutrient && matchesPrice && matchesRadius;
    });
    return result.sort((a, b) => sort === 'harga' ? Number(a.price_per_kg || 0) - Number(b.price_per_kg || 0) : sort === 'terdekat' ? (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [category, items, location, maxPrice, nutrient, query, radius, sort]);

  if (loading) return <main className="work-loading">Memuat marketplace…</main>;
  return <DashboardShell role="recycler" name={profile?.full_name || profile?.name} points={Number(profile?.total_points ?? profile?.points ?? 0)} onSignOut={async () => { await signOutUser(); router.replace('/login'); }}>
    <main className="market-page market-catalog-page">
      <header className="catalog-topbar"><div className="catalog-search"><Search size={19} /><input placeholder="Cari jenis limbah, area, atau kebutuhan pakan" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Button variant="outline" onClick={() => setShowMap((value) => !value)}><Map size={16} /> {showMap ? 'Tutup peta' : 'Lihat peta'}</Button></header>
      <section className="catalog-intro"><div><p className="work-kicker">MARKETPLACE MATERIAL ORGANIK</p><h2>Material terpilah untuk diolah kembali.</h2><p>Cari bahan untuk BSF, pakan akuakultur, kompos, dan pemanfaatan organik lain dari mitra terdekat.</p></div><button className="catalog-location" type="button" onClick={requestLocation}><LocateFixed size={17} /><span><b>Radius pencarian {radius} km</b><small>{locationState}</small></span></button></section>
      <section className="catalog-categories" aria-label="Kategori material"><button type="button" className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}><i>◎</i><span>Semua</span></button>{wasteCategories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}><i>{item.id === 'ampas' ? '◒' : item.id === 'daging_ikan' ? '◈' : item.id === 'buah' ? '◉' : '◌'}</i><span>{item.label}</span></button>)}</section>
      <section className="catalog-filterbar"><div className="catalog-filter-title"><SlidersHorizontal size={15} /> Filter</div><div className="catalog-filter-group"><span>Nutrisi</span><div>{[{ id: 'all', label: 'Semua' }, ...nutrientProfiles].map((item) => <button type="button" key={item.id} className={nutrient === item.id ? 'active' : ''} onClick={() => setNutrient(item.id)}>{item.label}</button>)}</div></div><label className="catalog-range"><span>Radius</span><input aria-label="Radius pencarian" type="range" min="5" max="15" step="5" value={radius} onChange={(event) => setRadius(Number(event.target.value))} /><b>{radius} km</b></label><label className="catalog-price"><span>Harga maks.</span><input type="number" min="0" placeholder="Tanpa batas" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label><label className="catalog-sort"><span>Urutkan</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="terbaru">Terbaru</option><option value="terdekat">Terdekat</option><option value="harga">Harga terendah</option></select></label></section>
      {showMap && <section className="catalog-map"><div><p className="work-kicker">PETA KETERSEDIAAN</p><h3>Titik material yang mencantumkan koordinat</h3><p>Gunakan radius di atas untuk mempersempit listing di sekitar lokasi Anda.</p></div><InteractiveMap locations={shown.map((item) => ({ ...item, lat: item.location_lat, lng: item.location_lng }))} /></section>}
      {message && <p className="work-form-error">{message}</p>}
      <section className="catalog-results-head"><div><h3>Material tersedia</h3><p>{shown.length} listing sesuai pencarian dan filter Anda.</p></div></section>
      <section className="market-listing-grid catalog-listing-grid">{shown.map((item) => <MarketplaceMaterialCard key={item.id} listing={item} href={`/dashboard/recycler/marketplace/${item.id}/checkout`} />)}</section>
      {!shown.length && <p className="market-empty">Belum ada material yang sesuai. Ubah kategori, radius, atau kata pencarian Anda.</p>}
    </main>
  </DashboardShell>;
}
