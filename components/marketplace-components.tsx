import Link from 'next/link';
import type * as React from 'react';
import { ArrowUpRight, Check, MapPin, PackageCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fulfillmentSteps, formatRupiah, type MarketplaceOrder } from '@/lib/marketplace';

export function OrderProgress({ status }: { status: string }) { const activeIndex = fulfillmentSteps.findIndex((item) => item.status === status); const current = activeIndex < 0 ? 0 : activeIndex; return <div className="market-progress">{fulfillmentSteps.map((step, index) => <div className={index <= current ? 'done' : ''} key={step.status}><i>{index < current ? <Check size={11} /> : index + 1}</i><section><strong>{step.label}</strong><span>{index === current ? step.detail : ''}</span></section></div>)}</div>; }
export function OrderCard({ order, href, action }: { order: MarketplaceOrder; href: string; action?: React.ReactNode }) { return <Card className="market-order-card"><CardContent><div className="market-order-top"><span>ORDER #{order.id.slice(0, 8).toUpperCase()}</span><b>{order.fulfillment_status.replaceAll('_', ' ')}</b></div><div className="market-order-info"><div><strong>{order.waste_listings?.waste_type || 'Material organik'}</strong><p><MapPin size={13} /> {order.waste_listings?.location_name || order.buyer_location_name || 'Lokasi belum dicantumkan'}</p></div><strong>{Number(order.quantity_kg).toLocaleString('id-ID')} kg</strong></div><div className="market-order-bottom"><span>{formatRupiah(order.total_amount)}</span>{action || <Button asChild size="sm" variant="outline"><Link href={href}>Lacak <ArrowUpRight size={14} /></Link></Button>}</div></CardContent></Card>; }
export function MarketplaceMaterialCard({ listing, href }: { listing: { id: string; waste_type: string; weight_kg: number; location_name: string; price_per_kg?: number; material_grade?: string | null; intended_use?: string | null; image_url?: string | null; category?: string | null; nutrient_profile?: string | null; status?: string | null; seller_name?: string | null; rating_average?: number | null; rating_count?: number; distance_km?: number | null }; href: string }) {
  const hasRating = Number(listing.rating_count || 0) > 0;
  return <Card className="material-card">
    <CardContent>
      <div className={`material-media material-media-${listing.category || 'campuran'}`}>
        {listing.image_url ? <img src={listing.image_url} alt={listing.waste_type} loading="lazy" /> : <span aria-hidden="true">{listing.category === 'ampas' ? '◒' : listing.category === 'daging_ikan' ? '◈' : listing.category === 'buah' ? '◉' : '◌'}</span>}
        <em>{listing.status === 'available' ? 'Tersedia' : 'Menunggu konfirmasi'}</em>
      </div>
      <div className="material-card-copy">
        <p className="material-seller">{listing.seller_name || 'Mitra BioLoop'}</p>
        <h3>{listing.waste_type}</h3>
        <p className="material-location"><MapPin size={13} /> {listing.location_name || 'Lokasi belum dicantumkan'}{typeof listing.distance_km === 'number' ? ` · ${listing.distance_km.toFixed(1)} km` : ''}</p>
        <div className="material-price"><b>{formatRupiah(Number(listing.price_per_kg || 0))}<small>/kg</small></b><strong>{Number(listing.weight_kg).toLocaleString('id-ID')}<small> kg tersedia</small></strong></div>
        <div className="material-tags"><span>{listing.material_grade || 'Terpilah'}</span><span>{listing.nutrient_profile?.replaceAll('_', ' ') || 'campuran'}</span></div>
        <div className="material-card-foot"><span className="material-rating">{hasRating ? <><Star size={13} fill="currentColor" /> {Number(listing.rating_average).toFixed(1)} <small>({listing.rating_count})</small></> : 'Belum ada penilaian'}</span><Button asChild size="sm"><Link href={href}>Detail <ArrowUpRight size={14} /></Link></Button></div>
      </div>
    </CardContent>
  </Card>;
}
