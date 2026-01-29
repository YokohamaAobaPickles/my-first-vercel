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
  ROLE_MANAGER: 'role_manager',
  GENERAL: 'general',
} as const;

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
  roles: string;

  // --- 任意項目 (is_nullable: YES) ---
  member_number?: string | null;
  line_id?: string | null;
  tel?: string | null;
  postal?: string | null;
  address?: string | null;
  dupr_id?: string | null;
  notes?: string | null;
  is_profile_public?: boolean | null;
  last_login_date?: string | null;
  req_date?: string | null;
  suspend_date?: string | null;
  retire_date?: string | null;
  create_date?: string | null;
  update_date?: string | null;
  password?: string | null;
  dupr_email?: string | null;
  reset_token?: string | null;
  reset_token_expires_at?: string | null;
  profile_memo?: string | null;
  emg_memo?: string | null;
  introducer?: string | null;
  approval_date?: string | null;
  reject_date?: string | null;
  dupr_rate?: number | null;
  dupr_rate_date?: string | null;
  gender?: string | null;
  birthday?: string | null;
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