/**
 * Filename: utils/auth.ts
 * Version : V1.4.2
 * Update  : 2026-01-26
 * 修正内容:
 * V1.4.2
 * - SYSTEM_ADMIN (system_admin) を復活
 * - hasPermission 内で system_admin 保持者への全権限許可を実装
 * - 会員管理権限の4者（会長・副会長・会員担当・システム管理者）対応
 * V1.3.0
 * - DB識別子の変更に伴うロール定数の小文字化と名称変更
 * - ANNOUNCEMENT_MANAGER -> notice_manager への変更
 */

// ロールの定数定義（DBに保存する識別子と一致させる）
export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  PRESIDENT: 'president',
  VICE_PRESIDENT: 'vice_president',
  MEMBER_MANAGER: 'member_manager',
  NOTICE_MANAGER: 'notice_manager',
  EVENT_MANAGER: 'event_manager',
  ACCOUNTANT: 'accountant',
  AUDITOR: 'auditor',
  ASSET_MANAGER: 'asset_manager',
} as const;

/**
 * ユーザーのロール文字列を配列に変換し、必要なロールのいずれかを持っているか判定する
 */
const hasPermission = (
  userRoles: string | null, 
  allowedRoles: string[]
): boolean => {
  if (!userRoles) {
    return false;
  }
  
  const userRolesArray = userRoles.split(',').map(r => r.trim());

  // システム管理者は、いかなる管理権限チェックも無条件でパスする
  if (userRolesArray.includes(ROLES.SYSTEM_ADMIN)) {
    return true;
  }
  
  // 許可されたロールリストのいずれかが、ユーザーの保持ロールに含まれているか
  return allowedRoles.some(role => userRolesArray.includes(role));
};

// --- 各機能ごとの権限チェック関数 ---

// 担当管理権限（ロール変更：会長・副会長・会員管理担当）
export const canManageRoles = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.MEMBER_MANAGER
  ]);

// 会員管理権限（承認・退会処理など：会長・副会長・会員管理担当）
// ※システム管理者は hasPermission 内で自動的に許可されるため、ここで 4 者になる
export const canManageMembers = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.MEMBER_MANAGER
  ]);

// お知らせ管理権限（作成・編集・削除）
export const canManageAnnouncements = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.NOTICE_MANAGER
  ]);

// イベント管理権限（作成・編集・削除）
export const canManageEvents = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.VICE_PRESIDENT, 
    ROLES.EVENT_MANAGER
  ]);

// 会計管理権限
export const canManageAccounts = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.ACCOUNTANT
  ]);

// 監査権限
export const canManageAudits = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.AUDITOR
  ]);

// 資産管理権限
export const canManageAssets = (roles: string | null) => 
  hasPermission(roles, [
    ROLES.PRESIDENT, 
    ROLES.ASSET_MANAGER
  ]);