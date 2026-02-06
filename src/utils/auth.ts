/**
 * src/utils/auth.ts
 * Version : V2.2.0
 * Update  : 2026-02-XX
 * 内容：
 * - roles を string[] に完全対応
 * - 代表役職（先頭）を使った認可ロジックに統一
 */

import { Member, MemberStatus, ROLES } from '@/types/member';

/**
 * 代表役職を取得する
 * roles が null/空配列なら '' を返す
 */
export const getPrimaryRole = (roles?: string[] | null): string =>
  roles?.[0] ?? '';

/**
 * 内部共通：権限判定コア
 * allowedRoles に primaryRole が含まれているかを判定
 */
const hasPermission = (
  primaryRole: string,
  allowedRoles: string[]
): boolean => {
  if (!primaryRole) return false;
  return allowedRoles.includes(primaryRole);
};

/**
 * ログイン可否判定
 */
export const canLogin = (status: MemberStatus | null): boolean => {
  if (!status) return false;
  const allowedStatuses: MemberStatus[] = [
    'active',
    'new_req',
    'suspended',
    'suspend_req',
    'rejoin_req',
    'withdraw_req'
  ];
  return allowedStatuses.includes(status);
};

/**
 * 特定ロール保持判定
 */
export const hasRole = (user: Member | null, role: string): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.includes(role);
};

// --- 機能別権限チェック ---
// 代表役職を使って判定する

export const canManageMembers = (roles: string[] | null | undefined): boolean => {
  if (!roles || roles.length === 0) return false;

  const allowed: string[] = [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.MEMBER_MANAGER,
  ];

  return roles.some((r) => allowed.includes(r));
};


export const canManageAnnouncements = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.ANNOUNCEMENT_MANAGER
  ] as string[]);


export const canManageEvents = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.EVENT_MANAGER
  ] as string[]);

export const canManageAccounts = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.ACCOUNTANT
  ] as string[]);

export const canManageAudits = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.AUDITOR
  ] as string[]);

export const canManageAssets = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.ASSET_MANAGER
  ] as string[]);

export const canManageRoles = (roles: string[] | null) =>
  hasPermission(getPrimaryRole(roles), [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT
  ] as string[]);
