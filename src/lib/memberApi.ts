/**
 * Filename: src/lib/memberApi.ts
 * Version : V3.0.0
 * Update  : 2026-01-29
 * Remarks : 
 * V3.0.0 - 修正：ステータス名称変更に対応 (new_req)
 * V3.0.0 - 修正：updateMemberStatus の引数に MemberStatus 型を適用
 * V3.0.0 - 書式：80カラムラップを維持
 */

import { supabase } from '@/lib/supabase';
import {
  Member,
  MemberInput,
  ApiResponse,
  MemberStatus
} from '@/types/member';

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
export const fetchMemberById = async (
  id: string
): Promise<ApiResponse<Member>> => {
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
 */
export const fetchMemberByEmail = async (
  email: string
): Promise<ApiResponse<Member | null>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) return handleError(error);
  return { success: true, data: data as Member | null, error: null };
};

/**
 * 承認待ちユーザーの一覧取得 (new_req)
 */
export const fetchPendingMembers = async (): Promise<ApiResponse<Member[]>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'new_req')
    .order('create_date', { ascending: false });

  if (error) return handleError(error);
  return { success: true, data: data as Member[], error: null };
};

/**
 * 会員のステータスを更新する (承認/拒否/休会/退会など)
 */
export const updateMemberStatus = async (
  id: string,
  status: MemberStatus
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id);

  if (error) return handleError(error);
  return { success: true, data: null, error: null };
};

/**
 * LINE ID の紐付け
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
 * ニックネームの重複チェック
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
 * * 退会時は data に withdraw_date を含めて呼び出す
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

/**
 * 新規会員登録 (初期ステータスは通常 new_req)
 */
export const registerMember = async (
  input: MemberInput
): Promise<ApiResponse<Member>> => {
  const { data, error } = await supabase
    .from('members')
    .insert(input)
    .select()
    .single();

  if (error) return handleError(error);
  return { success: true, data: data as Member, error: null };
};