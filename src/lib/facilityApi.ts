/**
 * Filename: facilityApi.ts
 * Version: V1.0.1
 * Update: 2026-03-03
 * Remarks: V1.0.1 - insertRegistrationGroup を実装。
 */

import { supabase } from '@/lib/supabase';
import { RegistrationGroup } from '@/types/facility';

/**
 * F-01: 登録団体情報をDBに登録する
 * @param group 登録する団体情報（ID等を除いたもの）
 */
export const insertRegistrationGroup = async (
  group: Omit<RegistrationGroup, 'id' | 'created_at' | 'updated_at'>
): Promise<RegistrationGroup | null> => {
  const { data, error } = await supabase
    .from('registration_groups')
    .insert([group])
    .select()
    .single();

  if (error) {
    // TDDのサイクル中、エラー詳細を確認しやすくするためにログを出力
    console.error('Error inserting registration group:', error);
    return null;
  }
  return data;
};