'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyJobsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/recycler/orders'); }, [router]);
  return <main className="work-loading">Mengarahkan ke pesanan Anda…</main>;
}
