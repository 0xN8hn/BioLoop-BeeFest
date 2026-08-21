'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function DriverHome(){const router=useRouter();useEffect(()=>{router.replace('/dashboard/driver/jobs')},[router]);return <main className="work-loading">Membuka pesanan masuk…</main>}
