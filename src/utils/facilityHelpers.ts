/**
 * Filename: facilityHelpers.ts
 * Version: V1.5.1
 * Update: 2026-03-03
 * Remarks: 
 * V1.5.1 - updateFacility が API層を呼ぶように修正。
 * V1.5.0 - updateFacility を実装。
 * V1.4.1 - Facility 型のインポート漏れを修正。
 * V1.4.0 - createFacility を実装。
 * V1.3.0 - removeRegistrationGroup を実装。 
 * V1.2.0 - getRegistrationGroups を実装。
 * V1.1.0 - updateRegistrationGroupInfo を実装。
 * V1.0.0 - F群 登録団体管理のビジネスロジックを実装。
 */

import { RegistrationGroup, Facility } from '@/types/facility';
import {
  insertRegistrationGroup,
  updateRegistrationGroup,
  fetchAllRegistrationGroups,
  deleteRegistrationGroup,
  insertFacility,
  updateFacility as apiUpdateFacility // 混乱を避けるため別名でインポート
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