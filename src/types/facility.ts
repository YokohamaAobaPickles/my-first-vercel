/**
 * Filename: facility.ts
 * Version: V1.0.0
 * Update: 2026-03-03
 * Remarks: V1.0.0 - F群（施設利用管理）の型定義を新規作成。
 */

// 登録団体情報 (F-01〜F-03関連)
export interface RegistrationGroup {
  id: string;
  registration_club_name: string;
  registration_club_number: string | null;
  representative_id: string; // 会員番号(4桁)
  vice_representative_id: string | null; // 会員番号(4桁)
  registration_club_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

// 今後、Facility や Reservation の定義もここに追加していく