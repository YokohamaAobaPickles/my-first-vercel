/**
 * Filename: src/types/event.ts
 * Version : V1.2.1
 * Update  : 2026-02-27
 * Remarks :
 * - V1.2.1 Version/Remarks 更新（抽選・キャンセル待ちロジック対応）
 * - V1.2.0 イベント更新用 EventUpdateInput 型を追加
 * - V1.1.0 イベント新規作成用 EventInput 型を追加
 * - V1.0.0 イベント管理（events / participants）用の型定義を新規作成
 */

import { ApiResponse } from './common';

/**
 * 性別ルール
 */
export type GenderRule = 'none' | 'female' | 'male';

/**
 * ペア申込ルール
 */
export type PairRule = 'solo' | 'pairRequired';

/**
 * イベント情報（Supabase events テーブル準拠）
 */
export interface Event {
  event_id: number;            // PK
  title: string;
  date: string;                // YYYY-MM-DD
  start_time: string;          // HH:mm
  end_time: string;            // HH:mm
  place: string;
  capacity: number | null;

  min_level: number | null;
  max_level: number | null;

  gender_rule: GenderRule;
  pair_rule: PairRule;

  parking_capacity: number | null;

  created_at: string | null;
  updated_at: string | null;
}

/**
 * イベント新規作成時の入力型（event_id / created_at / updated_at を除く）
 */
export type EventInput = Omit<
  Event,
  'event_id' | 'created_at' | 'updated_at'
>;

/**
 * イベント更新時の入力型（部分更新）
 */
export type EventUpdateInput = Partial<EventInput>;

/**
 * 参加ステータス
 */
export type ParticipantStatus =
  | 'pending'     // 申請済み（抽選待ち）
  | 'confirmed'   // 当選
  | 'canceled'    // ユーザーキャンセル
  | 'invalid';    // ペア不成立などで無効

/**
 * 参加者情報（Supabase participants テーブル準拠）
 */
export interface Participant {
  participant_id: number;      // PK
  event_id: number;            // FK: events.event_id
  user_id: string;             // FK: members.id (UUID)

  pair_user_id: string | null; // ペア相手の user_id（大会のみ）

  status: ParticipantStatus;

  parking_requested: boolean;  // 駐車場希望
  parking: boolean | null;     // 当選結果
  parking_lottery_order: number | null;

  created_at: string | null;
  updated_at: string | null;
}

/**
 * 参加申請時の入力型
 */
export interface ParticipantInput {
  event_id: number;
  user_id: string;
  pair_user_id?: string | null;
  parking_requested: boolean;
}

/**
 * 参加更新時の入力型（部分更新）
 */
export type ParticipantUpdateInput = Partial<ParticipantInput>;
