export type FulfillmentStatus = 'awaiting_payment' | 'ready_for_pickup' | 'driver_assigned' | 'picked_up' | 'in_transit' | 'received' | 'completed' | 'cancelled';
export type MarketplaceOrder = { id: string; listing_id: string; producer_id: string; buyer_id: string; quantity_kg: number; price_per_kg: number; material_subtotal: number; delivery_fee: number; service_fee: number; total_amount: number; producer_amount: number; payment_method: string; payment_status: string; fulfillment_status: FulfillmentStatus; logistics_mode?: 'mandiri' | 'armada_mitra' | 'pooling'; logistics_provider_name?: string | null; actual_weight_kg?: number | null; settled_material_subtotal?: number | null; settled_total_amount?: number | null; weight_variance_percent?: number | null; weight_confirmation_status?: 'pending' | 'confirmed' | 'review_needed'; escrow_status?: string; dispute_status?: string; buyer_location_name?: string | null; created_at: string; paid_at?: string | null; picked_up_at?: string | null; received_at?: string | null; completed_at?: string | null; waste_listings?: { waste_type: string; location_name: string; weight_kg: number } | null };

export const fulfillmentSteps: { status: FulfillmentStatus; label: string; detail: string }[] = [
  { status: 'awaiting_payment', label: 'Order dibuat', detail: 'Buyer memilih metode transaksi dan menunggu kesiapan seller.' },
  { status: 'ready_for_pickup', label: 'Siap diserahkan', detail: 'Seller menyatakan material siap diambil sesuai jadwal.' },
  { status: 'driver_assigned', label: 'Armada terjadwal', detail: 'Opsi armada atau pickup telah dicatat pada order.' },
  { status: 'picked_up', label: 'Sudah diambil', detail: 'Material sudah berpindah dari lokasi produsen.' },
  { status: 'in_transit', label: 'Dalam perjalanan', detail: 'Material menuju lokasi penerima.' },
  { status: 'received', label: 'Diterima pengolah', detail: 'Buyer menimbang dan mengonfirmasi kondisi material.' },
  { status: 'completed', label: 'Selesai', detail: 'Berat akhir tercatat; settlement dan rating dapat diproses.' },
];

export function formatRupiah(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0)); }
