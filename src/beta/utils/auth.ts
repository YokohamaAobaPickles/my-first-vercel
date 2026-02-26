/**
 * Filename: src/utils/auth.ts
 * Version : V2.3.1
 * Update  : 2026-02-08
 * Remarks : 
 * 2.3.1 - 副会長をイベント担当、会計担当、監査担当、資産担当に追加
 * 2.3.0 - 複数ロール（兼務）に完全対応するため hasPermission を some 判定に刷新
 */

import { Member, MemberStatus, ROLES } from '@/types/member';

/**
 * 代表役職を取得する（表示用などのために残すが、権限判定には使用しない）
 */
export const getPrimaryRole = (roles?: string[] | null): string =>
  roles?.[0] ?? '';

/**
 * 内部共通：権限判定コア
 * roles 配列の中に allowedRoles のいずれかが含まれているかを判定
 */
const hasPermission = (
  roles: string[] | null | undefined,
  allowedRoles: string[]
): boolean => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  // 配列のどこかに許可されたロールがあれば true
  return roles.some((role) => allowedRoles.includes(role));
};

/**
 * ログイン可否判定
 */
export const canLogin = (status: MemberStatus | null | undefined): boolean => {
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
export const hasRole = (user: Member | null | undefined, role: string): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.includes(role);
};

// --- 機能別権限チェック ---

export const canManageMembers = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.MEMBER_MANAGER,
  ]);

export const canManageAnnouncements = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.ANNOUNCEMENT_MANAGER
  ]);

export const canManageEvents = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.EVENT_MANAGER
  ]);

export const canManageAccounts = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.ACCOUNTANT
  ]);

export const canManageAudits = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.AUDITOR
  ]);

export const canManageAssets = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT,
    ROLES.VICE_PRESIDENT,
    ROLES.ASSET_MANAGER
  ]);

export const canManageRoles = (roles: string[] | null | undefined): boolean =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT
  ]);