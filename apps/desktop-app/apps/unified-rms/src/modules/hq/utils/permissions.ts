/**
 * Permission utility helpers.
 * Permissions are stored in localStorage as a JSON array after login.
 */

export function getPermissions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('permissions') || '[]');
  } catch {
    return [];
  }
}

export function hasPermission(code: string): boolean {
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  // Owner, Admin, and Branch Manager have all permissions by default for now
  if (role === 'owner' || role === 'admin' || role === 'branch_manager' || role === 'manager') return true;
  return getPermissions().includes(code);
}

export function getUserBranchId(): string | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem('branchId');
  return val && val !== '' ? val : null;
}

export function getUserRole(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userRole') || '';
}

/** Owner / Admin see everything; staff only see their own branch */
export function isManagerOrOwner(): boolean {
  const role = getUserRole().toLowerCase();
  return role === 'owner' || role === 'admin' || role === 'manager' || role === 'branch_manager';
}
