export type FulfillmentStatus = 'awaiting_payment' | 'ready_for_pickup' | 'driver_assigned' | 'picked_up' | 'in_transit' | 'received' | 'completed' | 'cancelled';
export type MarketplaceOrder = { id: string; listing_id: string; producer_id: string; buyer_id: string; driver_id?: string | null; quantity_kg: number; price_per_kg: number; material_subtotal: number; delivery_fee: number; service_fee: number; total_amount: number; producer_amount: number; driver_amount: number; payment_status: string; fulfillment_status: FulfillmentStatus; buyer_location_name?: string | null; created_at: string; paid_at?: string | null; picked_up_at?: string | null; received_at?: string | null; completed_at?: string | null; waste_listings?: { waste_type: string; location_name: string; weight_kg: number } | null };

export const fulfillmentSteps: { status: FulfillmentStatus; label: string; detail: string }[] = [
  { status: 'awaiting_payment', label: 'Menunggu pembayaran', detail: 'Order dibuat dan menunggu konfirmasi pembayaran.' },
  { status: 'ready_for_pickup', label: 'Siap dijemput', detail: 'Pembayaran tercatat; pickup bisa dijadwalkan.' },
  { status: 'driver_assigned', label: 'Driver ditugaskan', detail: 'Mitra logistik menerima detail penjemputan.' },
  { status: 'picked_up', label: 'Sudah diambil', detail: 'Material sudah berpindah dari lokasi produsen.' },
  { status: 'in_transit', label: 'Dalam perjalanan', detail: 'Material menuju lokasi penerima.' },
  { status: 'received', label: 'Diterima pengolah', detail: 'Penerima mengonfirmasi volume dan kondisi material.' },
  { status: 'completed', label: 'Selesai', detail: 'Fulfillment selesai; payout dapat diproses.' },
];

export function formatRupiah(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0)); }
