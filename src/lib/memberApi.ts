/**
 * Filename: src/lib/memberApi.ts
 * Version : V2.0.0
 * Update  : 2026-01-27
 * 内容：
 * - 会員データのCRUD操作（Supabase連携層）。
 * - V2.0.0 変更点:
 * 1. memberHelpers.ts から DB 問い合わせ関数を完全移管。
 * 2. maybeSingle() を採用し、データなしを正常系(null)として扱う。
 * 3. 全ての戻り値を ApiResponse<T> 形式に統一。
 */

import { supabase } from '@/lib/supabase';
import { Member, ApiResponse } from '@/types/member';

/**
 * 共通エラーハンドラー
 */
const handleError = (error: any): ApiResponse<any> => {
  console.error('Database Error:', error);
  return {
    success: false,
    data: null,
    error: {
      message: error.message || '予期せぬエラーが発生しました',
      code: error.code,
    },
  };
};

/**
 * 全会員一覧を取得する (管理者用)
 */
export const fetchMembers = async (): Promise<ApiResponse<Member[]>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('member_number', { ascending: true });

  if (error) return handleError(error);
  return { success: true, data: data as Member[], error: null };
};

/**
 * IDによる特定会員の取得
 */
export const fetchMemberById = async (id: string): Promise<ApiResponse<Member>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return handleError(error);
  return { success: true, data: data as Member, error: null };
};

/**
 * メールアドレスによる会員検索
 * * 重複チェックやアカウント連携で使用。データなし(null)を許容する。
 */
export const fetchMemberByEmail = async (
  email: string
): Promise<ApiResponse<Member | null>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .maybeSingle(); // 0件でもエラーにならず data: null を返す

  if (error) return handleError(error);
  return { success: true, data: data as Member | null, error: null };
};

/**
 * 承認待ちユーザーの一覧取得
 */
export const fetchPendingMembers = async (): Promise<ApiResponse<Member[]>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'registration_request')
    .order('create_date', { ascending: false });

  if (error) return handleError(error);
  return { success: true, data: data as Member[], error: null };
};

/**
 * 会員のステータスを更新する (承認/拒否など)
 */
export const updateMemberStatus = async (
  id: string,
  status: string
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id);

  if (error) return handleError(error);
  return { success: true, data: null, error: null };
};

/**
 * LINE ID の紐付け (アカウント統合用)
 */
export const linkLineIdToMember = async (
  email: string,
  lineId: string
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update({ line_id: lineId })
    .eq('email', email);

  if (error) return handleError(error);
  return { success: true, data: null, error: null };
};

/**
 * ニックネームの重複チェック（存在確認のみ）
 */
export const checkNicknameExists = async (
  nickname: string
): Promise<boolean> => {
  const { data } = await supabase
    .from('members')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle();

  return !!data;
};

/**
 * プロフィール情報の更新
 */
export const updateMemberProfile = async (
  id: string,
  data: Partial<Member>
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id);

  if (error) return handleError(error);
  return { success: true, data: null, error: null };
};