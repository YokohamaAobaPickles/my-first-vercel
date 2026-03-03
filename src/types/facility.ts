/**
 * Filename: facility.ts
 * Version: V1.2.0
 * Update: 2026-03-03
 * Remarks: 
 * V1.2.0 - Facility インターフェースを追加。
 * V1.1.0 - representative_id を nullable に変更。
 * V1.0.0 - F群（施設利用管理）の型定義を新規作成。
 */

/**
 * 登録団体情報の型定義
 */
export interface RegistrationGroup {
  id: string;
  registration_club_name: string;
  registration_club_number: string | null;
  representative_id: string | null; // string から string | null に修正
  vice_representative_id: string | null;
  registration_club_notes: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * F-11: 施設情報定義
 */
export interface Facility {
  id: string;
  facility_name: string;      // 施設名 (必須)
  address: string | null;     // 住所
  map_url: string | null;     // Google Map等のURL
  facility_notes: string | null; // 備考
  // どの登録団体に紐づくか (外部キー想定)
  registration_group_id: string | null; 
  created_at?: string;
  updated_at?: string;
}