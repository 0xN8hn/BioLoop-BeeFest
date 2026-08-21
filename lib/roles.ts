import type { UserRole } from './auth';

export const roleDashboardPath: Record<UserRole, string> = {
  producer: '/dashboard/preducer',
  recycler: '/dashboard/recycler',
  admin: '/dashboard/admin',
};

export function dashboardPathForRole(role?: string | null) {
  // Historic logistics accounts are preserved, but enter the buyer marketplace
  // while logistics is being transitioned to an order-level service.
  if (role === 'driver') return '/dashboard/recycler';
  return role && role in roleDashboardPath
    ? roleDashboardPath[role as UserRole]
    : '/login';
}

export const roleLabel: Record<UserRole, string> = {
  producer: 'Usaha makanan',
  recycler: 'Pembeli material',
  admin: 'Tim BioLoop',
};
