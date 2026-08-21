import type { UserRole } from './auth';

export const roleDashboardPath: Record<UserRole, string> = {
  producer: '/dashboard/preducer',
  recycler: '/dashboard/recycler',
  driver: '/dashboard/driver',
  admin: '/dashboard/admin',
};

export function dashboardPathForRole(role?: string | null) {
  return role && role in roleDashboardPath
    ? roleDashboardPath[role as UserRole]
    : '/login';
}

export const roleLabel: Record<UserRole, string> = {
  producer: 'Usaha makanan',
  recycler: 'Pengolah BSF',
  driver: 'Mitra logistik',
  admin: 'Tim BioLoop',
};
