/* BioLoop operational routing — authenticated users are routed directly from the neutral hub into their role workspace. */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth';
import { dashboardPathForRole } from '@/lib/roles';

export default function DashboardHub() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      try {
        const profile = await getCurrentUserProfile();
        router.replace(profile ? dashboardPathForRole(profile.role) : '/login');
      } catch {
        router.replace('/login');
      }
    }
    routeUser();
  }, [router]);

  return <main className="bl-dashboard-loading">Menyiapkan ruang kerja Anda…</main>;
}
