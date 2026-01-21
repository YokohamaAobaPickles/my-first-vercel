/**
 * Filename: utils/auth.ts
 * Version : V1.0.0
 * Update  : 2026-01-21 
 */
export const isAdmin = (roles: string | null): boolean => {
  if (!roles) return false
  const adminRoles = ['役員', '広報']
  return adminRoles.some(role => roles.includes(role))
}