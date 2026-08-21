'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function RecyclerHome(){const router=useRouter();useEffect(()=>{router.replace('/dashboard/recycler/marketplace')},[router]);return <main className="work-loading">Membuka marketplace…</main>}
