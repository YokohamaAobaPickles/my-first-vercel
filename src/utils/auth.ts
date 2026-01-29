/**
 * src/utils/auth.ts
 * Version : V2.1.1
 * Update  : 2026-01-27
 * 内容：
 * - 権限・ログイン可否判定ロジック。
 * - 以前このファイルにあった ROLES 定義を削除し、@/types/member に一本化。
 */
import { Member, MemberStatus, ROLES } from '@/types/member';

/**
 * 内部共通：権限判定コア
 * 配列に含まれているロールのみを許可する（隠れた判定を持たない）
 * @param userRoles - 会員が持つカンマ区切りのロール文字列
 * @param allowedRoles - 許可されるロールの配列
 */
const hasPermission = (
  userRoles: string | null,
  allowedRoles: string[]
): boolean => {
  if (!userRoles) return false;
  
  // カンマ区切りの文字列を配列に変換
  const userRolesArray = userRoles.split(',').map((r) => r.trim());
  
  // allowedRoles 配列に含まれているかどうかをチェック
  return allowedRoles.some((role) => userRolesArray.includes(role));
};

/**
 * ログイン可否判定
 * * ステータスに基づいてログインを許可するかを決定する
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
 * 特定ロール保持判定 (単体チェック用)
 */
export const hasRole = (user: Member | null, role: string): boolean => {
  if (!user || !user.roles) return false;
  const userRolesArray = user.roles.split(',').map((r) => r.trim());
  return userRolesArray.includes(role);
};

// --- 機能別権限チェック ---
// ROLES オブジェクトは @/types/member から提供されるものを使用

export const canManageMembers = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.MEMBER_MANAGER
  ]);

export const canManageAnnouncements = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.ANNOUNCEMENT_MANAGER
  ]);

export const canManageEvents = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.EVENT_MANAGER
  ]);

export const canManageAccounts = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.ACCOUNTANT
  ]);

export const canManageAudits = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.AUDITOR
  ]);

export const canManageAssets = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT, 
    ROLES.ASSET_MANAGER
  ]);

export const canManageRoles = (roles: string | null) =>
  hasPermission(roles, [
    ROLES.SYSTEM_ADMIN,
    ROLES.PRESIDENT
  ]);