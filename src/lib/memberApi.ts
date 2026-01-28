/**
 * Filename: src/lib/memberApi.ts
 * Version : V2.0.1
 * Update  : 2026-01-28
 * Remarks : 
 * V2.0.1 - registerMember の戻り値を ApiResponse<Member> に変更
 * V2.0.1 - insert 時に .select().single() を追加し、作成されたレコードを返却
 * V2.0.1 - 書式遵守：80カラムラップを適用
 */

import { supabase } from '@/lib/supabase';
import { Member, MemberInput, ApiResponse } from '@/types/member';

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
 * * 重複チェックやアカウント連携で使用。データなし(null)を許容する。
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

/**
 * 新規会員登録 (API層)
 * * パスワードや初期ステータスを含む会員データをDBに保存する
 * * 成功時は作成されたレコード(id等を含む)を返す
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