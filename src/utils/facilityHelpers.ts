/**
 * Filename: facilityHelpers.ts
 * Version: V1.7.0
 * Update: 2026-03-03
 * Remarks:
 * V1.7.0 - F-21〜F-24 施設予約 (create/update/remove/get) を実装。
 * V1.6.0 - F-13 removeFacility, F-14 getFacilities を実装。
 * V1.5.1 - updateFacility が API層を呼ぶように修正。
 * V1.5.0 - updateFacility を実装。
 * V1.4.1 - Facility 型のインポート漏れを修正。
 * V1.4.0 - createFacility を実装。
 * V1.3.0 - removeRegistrationGroup を実装。
 * V1.2.0 - getRegistrationGroups を実装。
 * V1.1.0 - updateRegistrationGroupInfo を実装。
 * V1.0.0 - F群 登録団体管理のビジネスロジックを実装。
 */

import {
  RegistrationGroup,
  Facility,
  FacilityReservation
} from '@/types/facility';
import {
  insertRegistrationGroup,
  updateRegistrationGroup,
  fetchAllRegistrationGroups,
  deleteRegistrationGroup,
  insertFacility,
  updateFacility as apiUpdateFacility,
  deleteFacility,
  fetchAllFacilities,
  insertReservation,
  updateReservation as apiUpdateReservation,
  deleteReservation,
  fetchAllReservations
} from '@/lib/facilityApi';
/**
 * F-01: 登録団体情報の新規登録
 */
export const createRegistrationGroup = async (
  group: Omit<RegistrationGroup, 'id' | 'created_at' | 'updated_at'>
): Promise<RegistrationGroup | null> => {
  // バリデーション: 団体名が空の場合は登録させない
  if (!group.registration_club_name ||
    group.registration_club_name.trim() === '') {
    return null;
  }

  // 4桁の会員番号（代表者）が入力されているか等のチェックもここで行う

  return await insertRegistrationGroup(group);
};

/**
 * F-02: 登録団体情報の更新ロジック
 */
export const updateRegistrationGroupInfo = async (
  id: string,
  group: Partial<Omit<RegistrationGroup, 'id' | 'created_at' | 'updated_at'>>
): Promise<RegistrationGroup | null> => {
  // バリデーション: 名称が空文字に更新されようとした場合は拒否
  if (group.registration_club_name !== undefined &&
    group.registration_club_name.trim() === '') {
    return null;
  }

  return await updateRegistrationGroup(id, group);
};

/**
 * F-03: 登録団体情報の削除ロジック
 */
export const removeRegistrationGroup = async (
  id: string
): Promise<boolean> => {
  if (!id) return false;
  return await deleteRegistrationGroup(id);
};

/**
 * F-04: 登録団体一覧を取得するロジック
 */
export const getRegistrationGroups = async (): Promise<RegistrationGroup[]> => {
  return await fetchAllRegistrationGroups();
};

/**
 * F-11: 施設新規登録ロジック
 */
export const createFacility = async (
  facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>
): Promise<Facility | null> => {
  // バリデーション
  if (!facility.facility_name || facility.facility_name.trim() === '') {
    return null;
  }

  return await insertFacility(facility);
};

/**
 * F-12: 施設情報更新ロジック
 * @param id 更新対象のUUID
 * @param facility 更新項目
 */
export const updateFacilityInfo = async (
  id: string,
  facility: Partial<Omit<Facility, 'id' | 'created_at' | 'updated_at'>>
): Promise<Facility | null> => {
  // 名称変更が含まれる場合、空文字チェックを行う
  if (facility.facility_name !== undefined && 
      facility.facility_name.trim() === '') {
    return null;
  }

  // API層の updateFacility を呼び出す
  return await apiUpdateFacility(id, facility);
};

/**
 * F-13: 施設情報の削除ロジック
 */
export const removeFacility = async (id: string): Promise<boolean> => {
  if (!id) return false;
  return await deleteFacility(id);
};

/**
 * F-14: 施設一覧を取得するロジック
 */
export const getFacilities = async (): Promise<Facility[]> => {
  return await fetchAllFacilities();
};

/**
 * F-21: 施設予約の新規登録ロジック
 * reserved_courts が 1 未満の場合は null を返す。
 */
export const createReservation = async (
  res: Omit<FacilityReservation, 'id' | 'created_at' | 'updated_at'>
): Promise<FacilityReservation | null> => {
  if (res.reserved_courts < 1) {
    return null;
  }
  return await insertReservation(res);
};

/**
 * F-22: 施設予約情報の更新ロジック
 */
export const updateReservationInfo = async (
  id: string,
  res: Partial<Omit<FacilityReservation, 'id' | 'created_at' | 'updated_at'>>
): Promise<FacilityReservation | null> => {
  return await apiUpdateReservation(id, res);
};

/**
 * F-23: 施設予約の削除ロジック
 */
export const removeReservation = async (id: string): Promise<boolean> => {
  if (!id) return false;
  return await deleteReservation(id);
};

/**
 * F-24: 施設予約一覧を取得するロジック
 */
export const getReservations = async (): Promise<FacilityReservation[]> => {
  return await fetchAllReservations();
};