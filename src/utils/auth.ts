/**
 * Filename: utils/auth.ts
 * Version : V1.3.0
 * Update  : 2026-01-23
 * 修正内容:
 * V1.3.0
 * - DB識別子の変更に伴うロール定数の小文字化と名称変更
 * - ANNOUNCEMENT_MANAGER -> notice_manager への変更
 * * V1.2.0
 * - 権限判定改善
 * V1.1.0
 * - 会長・副会長・各担当の権限をチェックする
 */

// ロールの定数定義（DBに保存する識別子と一致させる）
export const ROLES = {
  PRESIDENT: 'president',
  VICE_PRESIDENT: 'vice_president',
  MEMBER_MANAGER: 'member_manager',
  NOTICE_MANAGER: 'notice_manager', // 変更
  EVENT_MANAGER: 'event_manager',
  ACCOUNTANT: 'accountant',
  AUDITOR: 'auditor',
  ASSET_MANAGER: 'asset_manager',
} as const;

/**
 * ユーザーのロール文字列を配列に変換し、必要なロールのいずれかを持っているか判定する
 */
const hasPermission = (userRoles: string | null, allowedRoles: string[]): boolean => {
  if (!userRoles) return false;
  
  // DB保存値が小文字のスネークケースなので、trimのみで比較
  const userRolesArray = userRoles.split(',').map(r => r.trim());
  
  // 許可されたロールリストのいずれかが、ユーザーの保持ロールに含まれているか
  return allowedRoles.some(role => userRolesArray.includes(role));
};

// --- 各機能ごとの権限チェック関数 ---

// 担当管理権限（ロール変更：会長・副会長・会員管理担当）
// A-41の仕様に基づき、会員管理担当も自分より下のロールを任命できるため追加
export const canManageRoles = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.MEMBER_MANAGER]);

// 会員管理権限（承認・退会処理など）
export const canManageMembers = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.MEMBER_MANAGER]);

// お知らせ管理権限（作成・編集・削除）
export const canManageAnnouncements = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.NOTICE_MANAGER]);

// イベント管理権限（作成・編集・削除）
export const canManageEvents = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.EVENT_MANAGER]);

// 会計管理権限（請求・記録）
export const canManageAccounts = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.ACCOUNTANT]);

// 会計監査権限（記録承認）
export const canManageAudits = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.AUDITOR]);

// 資産管理権限（作成・編集・承認）
export const canManageAssets = (roles: string | null) => 
  hasPermission(roles, [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.ASSET_MANAGER]);