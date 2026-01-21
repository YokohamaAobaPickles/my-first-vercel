/**
 * Filename: utils/auth.ts
 * Version : V1.2.0
 * Update  : 2026-01-21 
 * 修正内容
 * V1.2.0
 * - 権限判定改善
 * V1.1.0
 * - 会長・副会長・各担当の権限をチェックする
 */
// ロールの定数定義（タイポ防止）
export const ROLES = {
  PRESIDENT: 'PRESIDENT',
  VICE_PRESIDENT: 'VICE_PRESIDENT',
  MEMBER_MANAGER: 'MEMBER_MANAGER',
  ANNOUNCEMENT_MANAGER: 'ANNOUNCEMENT_MANAGER',
  EVENT_MANAGER: 'EVENT_MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  AUDITOR: 'AUDITOR',
  ASSET_MANAGER: 'ASSET_MANAGER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;

/**
 * ユーザーのロール文字列を配列に変換し、必要なロールのいずれかを持っているか判定する
 */
const hasPermission = (userRoles: string | null, allowedRoles: string[]): boolean => {
  if (!userRoles) return false;
  
  // カンマで分割し、各要素の前後空白を削除
  const userRolesArray = userRoles.split(',').map(r => r.trim().toUpperCase());
  
  // 許可されたロールリストのいずれかが、ユーザーの保持ロールに含まれているか
  return allowedRoles.some(role => userRolesArray.includes(role));
};

// --- 各機能ごとの権限チェック関数 ---

// 担当管理権限（担当変更）
export const canManageRoles = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.SYSTEM_ADMIN]);

// 会員管理権限（承認・退会処理など）
export const canManageMembers = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.MEMBER_MANAGER, ROLES.SYSTEM_ADMIN]);

// お知らせ管理権限（作成・編集・削除）
export const canManageAnnouncements = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.ANNOUNCEMENT_MANAGER, ROLES.SYSTEM_ADMIN]);

// イベント管理権限（作成・編集・削除）
export const canManageEvents = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.EVENT_MANAGER, ROLES.SYSTEM_ADMIN]);

// 会計管理権限（請求・記録）
export const canManageAccounts = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.ACCOUNTANT, ROLES.SYSTEM_ADMIN]);

// 会計監査権限（記録承認）
export const canManageAudits = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.AUDITOR, ROLES.SYSTEM_ADMIN]);

// 資産管理権限（作成・編集・承認）
export const canManageAssets = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.ASSET_MANAGER, ROLES.SYSTEM_ADMIN]);