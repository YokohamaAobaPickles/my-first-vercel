/**
 * Filename: src/types/member.ts
 * Version : V2.3.0
 * Update  : 2026-01-27
 * 内容：
 * - MemberStatus を最新の8状態に更新
 * - Member インターフェースを最新スキーマ（is_nullable）に完全準拠
 * - MemberInput を現状の入力仕様（ID、日付、会員番号を除外）に最適化
 */

import { ApiResponse } from './common';
// 再エクスポートすることで memberApi.ts 等がここから import できるようになる
export type { ApiResponse };

/**
 * 会員ステータスの定義 (2026-01-27 更新)
 */
export type MemberStatus =
  | 'new_req'              // 申請中
  | 'active'                // 有効
  | 'suspend_req'           // 休会申請中
  | 'suspended'             // 休会中
  | 'rejoin_req'            // 復帰申請中
  | 'withdraw_req'          // 退会申請中
  | 'withdrawn'             // 退会済み
  | 'rejected';             // 拒絶

// ラベルの定義を集約
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  new_req: '入会申請中',
  active: '有効',
  suspend_req: '休会申請中',
  suspended: '休会中',
  rejoin_req: '復帰申請中',
  withdraw_req: '退会申請中',
  withdrawn: '退会済',
  rejected: '拒否'
};

export const MEMBER_KIND_LABELS: Record<string, string> = {
  general: '一般',
  premium: 'プレミアム',
  family: 'ファミリー',
  officer: '管理者'
};

/**
 * システムロールの定数
 */
export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  PRESIDENT: 'president',
  VICE_PRESIDENT: 'vice_president',
  MEMBER_MANAGER: 'member_manager',
  ANNOUNCEMENT_MANAGER: 'announcement_manager',
  EVENT_MANAGER: 'event_manager',
  ACCOUNTANT: 'accountant',
  AUDITOR: 'auditor',
  ASSET_MANAGER: 'asset_manager',
  MEMBER: 'member',
} as const;

export const ROLES_LABELS: Record<string, string> = {
  [ROLES.SYSTEM_ADMIN]: 'システム管理者',
  [ROLES.PRESIDENT]: '会長',
  [ROLES.VICE_PRESIDENT]: '副会長',
  [ROLES.MEMBER_MANAGER]: '会員担当',
  [ROLES.ANNOUNCEMENT_MANAGER]: 'お知らせ担当',
  [ROLES.EVENT_MANAGER]: 'イベント担当',
  [ROLES.ACCOUNTANT]: '会計担当',
  [ROLES.AUDITOR]: '監査担当',
  [ROLES.ASSET_MANAGER]: '資産担当',
  [ROLES.MEMBER]: '', // 役職無し
};

/**
 * 会員情報のインターフェース
 * Supabase 実スキーマ準拠
 */
export interface Member {
  // --- 必須項目 (is_nullable: NO) ---
  id: string;
  email: string;
  name: string;
  name_roma: string;
  nickname: string;
  emg_tel: string;
  emg_rel: string;
  status: MemberStatus;
  member_kind: string;
  roles: string[];

  // --- 任意項目 (is_nullable: YES) ---
  member_number?: string | null;
  line_id?: string | null;
  password?: string | null;
  gender?: string | null;
  birthday?: string | null;
  tel?: string | null;
  postal?: string | null;
  address?: string | null;
  profile_icon_url?: string | null;
  profile_memo?: string | null;
  emg_memo?: string | null;
  introducer?: string | null;
  dupr_id?: string | null;
  dupr_email?: string | null;
  dupr_rate?: number | null;          // 過去互換のため残した
  dupr_rate_singles?: number | null;
  dupr_rate_doubles?: number | null;
  dupr_rate_date?: string | null;
  is_profile_public?: boolean | null;
  last_login_date?: string | null;
  req_date?: string | null;
  approval_date?: string | null;
  suspend_date?: string | null;
  withdraw_date?: string | null;
  reject_date?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  reset_token?: string | null;
  reset_token_expires_at?: string | null;
}

/**
 * 登録・編集時の入力用型定義
 * システム側で自動管理される項目を除外
 */
export type MemberInput = Omit<
  Member,
  | 'id'
  | 'member_number'
  | 'create_date'
  | 'update_date'
  | 'last_login_date'
>;