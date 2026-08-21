'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyLogisticsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/recycler/marketplace'); }, [router]);
  return <main className="work-loading">Membuka marketplace BioLoop…</main>;
}
