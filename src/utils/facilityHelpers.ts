/**
 * Filename: facilityHelpers.ts
 * Version: V1.0.0
 * Update: 2026-03-03
 * Remarks: V1.0.0 - F群 登録団体管理のビジネスロジックを実装。
 */

import { RegistrationGroup } from '@/types/facility';
import { insertRegistrationGroup } from '@/lib/facilityApi';

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