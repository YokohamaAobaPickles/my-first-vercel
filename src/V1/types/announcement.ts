/**
* Filename: src/types/announcement.ts
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks : 
 * V1.0.0
 * - 新規作成。Supabaseの announcements テーブルと announcement_reads テーブルに基づく型定義を作成。
 */

import { ApiResponse } from '@v1/types/common';

/**
 * お知らせステータス
 */
export type AnnouncementStatus =
  | 'draft'      // 下書き
  | 'published'  // 公開
  | 'disabled';  // 無効（論理削除）

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: '下書き',
  published: '公開',
  disabled: '無効'
};

/**
 * お知らせ公開対象
 */
export type AnnouncementTarget =
  | 'all'        // 全員
  | 'premium';   // プレミアム会員限定

/**
 * お知らせ情報（Supabase announcements テーブル準拠）
 */
export interface Announcement {
  announcement_id: number;     // 記事固有のID (PK)
  title: string;
  content: string | null;
  publish_date: string | null; // YYYY-MM-DD
  end_date: string | null;     // YYYY-MM-DD
  status: AnnouncementStatus;
  author_id: string | null;    // 作成者の members.id (UUID)
  is_pinned: boolean;
  target_role: AnnouncementTarget;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * 既読情報（announcement_reads テーブル準拠）
 */
export interface AnnouncementRead {
  read_id: string;             // 既読ログ固有のID (PK, UUID)
  announcement_id: number;     // 対象記事のID (FK)
  member_id: string;           // 読んだ会員の識別子 (FK: members.id)
  read_at: string;             // 既読日時 (timestamp)
}

/**
 * 既読詳細（会員情報付き）
 */
export type AnnouncementReadDetail = {
  read_at: string;
  member_id: string;
  members: {
    member_number: string | null;
    nickname: string;
    email: string;
    name: string;
  };
};


/**
 * お知らせ作成・更新時の入力型
 */
export type AnnouncementInput = Omit<
  Announcement,
  'announcement_id' | 'created_at' | 'updated_at'
>;

/**
 * お知らせ一覧取得時のレスポンス（既読フラグ付き）
 */
export type AnnouncementListItem = {
  announcement_id: number
  title: string
  content: string | null
  publish_date: string | null
  is_pinned: boolean
  status: AnnouncementStatus
  is_read: boolean            // 閲覧中のユーザーが既読済みか
  read_count: number          // 管理者用：既読数
  target_role: string
  created_at: string
  updated_at: string
}