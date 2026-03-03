/**
 * Filename: facilityApi.ts
 * Version: V1.7.0
 * Update: 2026-03-03
 * Remarks:
 * V1.7.0 - F-21〜F-24 施設予約 (insert/update/delete/fetch) を実装。
 * V1.6.0 - F-13 deleteFacility, F-14 fetchAllFacilities を実装。
 * V1.5.0 - updateFacility を実装。
 * V1.4.0 - insertFacility を実装。
 * V1.3.0 - deleteRegistrationGroup を実装。
 * V1.2.0 - fetchAllRegistrationGroups を実装。
 * V1.1.0 - updateRegistrationGroup を実装。
 * V1.0.1 - insertRegistrationGroup を実装。
 */

import { supabase } from '@/lib/supabase';
import {
  RegistrationGroup,
  Facility,
  FacilityReservation
} from '@/types/facility';

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
/**
 * F-02: 登録団体情報を更新する
 */
export const updateRegistrationGroup = async (
  id: string,
  group: Partial<Omit<RegistrationGroup, 'id' | 'created_at' | 'updated_at'>>
): Promise<RegistrationGroup | null> => {
  const { data, error } = await supabase
    .from('registration_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating registration group:', error);
    return null;
  }
  return data;
};
/**
 * F-03: 登録団体情報を物理削除する
 * @param id 削除対象のUUID
 */
export const deleteRegistrationGroup = async (
  id: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('registration_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting registration group:', error);
    return false;
  }

  return true;
};
/**
 * F-04: 全ての登録団体情報を取得する
 * 作成日時（created_at）の降順で取得します。
 */
export const fetchAllRegistrationGroups = async (): Promise<RegistrationGroup[]> => {
  const { data, error } = await supabase
    .from('registration_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching registration groups:', error);
    return [];
  }

  return data || [];
};

/**
 * F-11: 施設情報をDBに登録する
 * @param facility 登録する施設情報
 */
export const insertFacility = async (
  facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>
): Promise<Facility | null> => {
  const { data, error } = await supabase
    .from('facilities')
    .insert([facility])
    .select()
    .single();

  if (error) {
    console.error('Error inserting facility:', error);
    return null;
  }
  return data;
};
/**
 * F-12: 施設情報を更新する
 * @param id 更新対象のUUID
 * @param facility 更新する項目
 */
export const updateFacility = async (
  id: string,
  facility: Partial<Omit<Facility, 'id' | 'created_at' | 'updated_at'>>
): Promise<Facility | null> => {
  const { data, error } = await supabase
    .from('facilities')
    .update(facility)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating facility:', error);
    return null;
  }
  return data;
};

/**
 * F-13: 施設情報を物理削除する
 * @param id 削除対象のUUID
 */
export const deleteFacility = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('facilities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting facility:', error);
    return false;
  }

  return true;
};

/**
 * F-14: 全ての施設情報を取得する
 * 作成日時（created_at）の降順で取得します。
 */
export const fetchAllFacilities = async (): Promise<Facility[]> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }

  return data || [];
};

/**
 * F-21: 施設予約情報をDBに登録する
 * @param res 登録する予約情報
 */
export const insertReservation = async (
  res: Omit<FacilityReservation, 'id' | 'created_at' | 'updated_at'>
): Promise<FacilityReservation | null> => {
  const { data, error } = await supabase
    .from('facility_reservations')
    .insert([res])
    .select()
    .single();

  if (error) {
    console.error('Error inserting reservation:', error);
    return null;
  }
  return data;
};

/**
 * F-22: 施設予約情報を更新する
 * @param id 更新対象のUUID
 * @param res 更新する項目
 */
export const updateReservation = async (
  id: string,
  res: Partial<Omit<FacilityReservation, 'id' | 'created_at' | 'updated_at'>>
): Promise<FacilityReservation | null> => {
  const { data, error } = await supabase
    .from('facility_reservations')
    .update(res)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reservation:', error);
    return null;
  }
  return data;
};

/**
 * F-23: 施設予約情報を物理削除する
 * @param id 削除対象のUUID
 */
export const deleteReservation = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('facility_reservations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reservation:', error);
    return false;
  }

  return true;
};

/**
 * F-24: 全ての施設予約情報を取得する
 * reservation_date の昇順で取得します。
 */
export const fetchAllReservations = async (): Promise<FacilityReservation[]> => {
  const { data, error } = await supabase
    .from('facility_reservations')
    .select('*')
    .order('reservation_date', { ascending: true });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return data || [];
};