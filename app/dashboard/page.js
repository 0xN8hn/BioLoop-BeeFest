'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/auth';

export default function DashboardHub() {
  const router = useRouter();
  const [roleName, setRoleName] = useState('memuat...');

  useEffect(() => {
    async function checkRole() {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        router.push('/login');
        return;
      }

      setRoleName(profile.role);

      // Redirect otomatis sesuai folder yang kamu punya
      if (profile.role === 'admin') router.push('/dashboard/admin');
      else if (profile.role === 'driver') router.push('/dashboard/driver');
      else if (profile.role === 'producer') router.push('/dashboard/preducer'); // Sesuai ejaan folder kamu 'preducer'
      else if (profile.role === 'recycler') router.push('/dashboard/recycler');
      else router.push('/login');
    }

    checkRole();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm font-medium">Mengarahkan ke dashboard {roleName}...</p>
    </div>
  );
}