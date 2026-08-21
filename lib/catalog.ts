export type WasteCategory = 'sayur' | 'buah' | 'ampas' | 'daging_ikan' | 'sisa_olahan' | 'campuran';
export type NutrientProfile = 'tinggi_protein' | 'tinggi_karbohidrat' | 'serat' | 'campuran';

export const wasteCategories: { id: WasteCategory; label: string; caption: string }[] = [
  { id: 'sayur', label: 'Limbah sayur', caption: 'Daun, batang, sayur layu' },
  { id: 'buah', label: 'Limbah buah', caption: 'Kulit dan potongan buah' },
  { id: 'ampas', label: 'Ampas tahu & kelapa', caption: 'Sisa produksi pangan' },
  { id: 'daging_ikan', label: 'Sisa daging & ikan', caption: 'Protein hewani terpilah' },
  { id: 'sisa_olahan', label: 'Sisa olahan', caption: 'Sisa masak siap olah' },
  { id: 'campuran', label: 'Campuran organik', caption: 'Material terpilah lainnya' },
];

export const nutrientProfiles: { id: NutrientProfile; label: string }[] = [
  { id: 'tinggi_protein', label: 'Tinggi protein' },
  { id: 'tinggi_karbohidrat', label: 'Tinggi karbohidrat' },
  { id: 'serat', label: 'Serat' },
  { id: 'campuran', label: 'Campuran' },
];

export const categoryLabel = (category?: string | null) => wasteCategories.find((item) => item.id === category)?.label || 'Material organik';
export const nutrientLabel = (nutrient?: string | null) => nutrientProfiles.find((item) => item.id === nutrient)?.label || 'Campuran';

export function haversineDistanceKm(
  origin?: { lat: number; lng: number } | null,
  destination?: { lat?: number | null; lng?: number | null } | null,
) {
  if (!origin || typeof destination?.lat !== 'number' || typeof destination?.lng !== 'number') return null;
  const toRadians = (value: number) => value * (Math.PI / 180);
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(origin.lat)) * Math.cos(toRadians(destination.lat)) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
