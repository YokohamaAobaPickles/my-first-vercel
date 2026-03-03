/**
 * Filename: facilityHelpers.ts
 * Version: V1.3.0
 * Update: 2026-03-03
 * Remarks: 
 * V1.3.0 - removeRegistrationGroup を実装。 
 * V1.2.0 - getRegistrationGroups を実装。
 * V1.1.0 - updateRegistrationGroupInfo を実装。
 * V1.0.0 - F群 登録団体管理のビジネスロジックを実装。
 */

import { RegistrationGroup } from '@/types/facility';
import { 
  insertRegistrationGroup, 
  updateRegistrationGroup,
  fetchAllRegistrationGroups,
  deleteRegistrationGroup 
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