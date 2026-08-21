'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ProducerHome(){const router=useRouter();useEffect(()=>{router.replace('/dashboard/preducer/listings')},[router]);return <main className="work-loading">Membuka listing Anda…</main>}
