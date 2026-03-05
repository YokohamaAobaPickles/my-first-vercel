/**
 * Filename: facility.ts
 * Version: V1.1.0
 * Update: 2026-03-05
 * Remarks:
 * V1.1.0 - Facility を最新DBスキーマに合わせてプロパティ追加。
 * V1.3.0 - FacilityReservation インターフェースを追加
 * V1.2.0 - Facility インターフェースを追加
 * V1.1.0 - representative_id を nullable に変更
 * V1.0.0 - F群（施設利用管理）の型定義を新規作成
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
 * 施設情報定義
 */
export interface Facility {
  id: string;
  facility_name: string;
  address: string | null;
  map_url: string | null;
  facility_notes: string | null;
  registration_group_id: string | null;
  phone: string | null;
  email: string | null;
  facility_url: string | null;
  facility_fee_desc: string | null;
  court_numbers: string | null;
  lottery_date_desc: string | null;
  registration_date: string | null;
  renewal_date: string | null;
  registration_fee: number | null;
  annual_fee: number | null;
  parking_capacity: number | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * F-21: 施設予約情報定義
 */
export interface FacilityReservation {
  id: string;
  facility_id: string;          // 施設ID
  registration_group_id: string | null; // 予約団体ID
  reservation_number: string | null;    // 予約番号
  reservation_date: string;     // 予約日 (YYYY-MM-DD)
  reservation_time_slot: string; // 予約時間 (例: 13:00-15:00)
  reserved_courts: number;      // 予約コート数
  reserved_fee: number;         // 費用
  reservation_limit: string | null; // 費用支払い期限 (YYYY-MM-DD)
  reserver_name: string | null;  // 予約者 (会員番号等と連動)
  lottery_results: string | null; // 利用抽選当落情報 (当選/落選/待機等)
  reservation_notes: string | null; // 予約メモ
  created_at?: string;
  updated_at?: string;
}