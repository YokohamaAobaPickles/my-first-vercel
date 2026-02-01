/**
 * Filename: src/lib/memberApi.ts
 * Version : V3.6.0
 * Update  : 2026-02-01
 * Remarks : 
 * V3.6.1 - 修正：registerMember で introducer_member_number を送信前に除外（PGRST204 エラー防止）。
 * V3.6.0 - 追加：fetchMemberByNicknameAndMemberNumber（ニックネーム＋会員番号で紹介者取得。ゲスト登録用）。
 * V3.5.0 - 追加：fetchMemberByNicknameAndEmail（ニックネーム＋メールで会員取得。物理削除指定用）。
 * V3.4.0 - 追加：checkMemberReferenced（物理削除前の参照チェック。announcements.author_id を確認）。
 * V3.3.2 - 修正：fetchMemberByDuprId で同一 dupr_id 複数時は更新せずエラーを返す（重複解消を促すメッセージ）。
 * V3.3.1 - 修正：fetchMemberByDuprId を maybeSingle → limit(1) に変更（同一 dupr_id 複数時エラー回避）。
 * V3.3.0 - 追加：fetchMemberByDuprId（DUPR一括登録用）。
 * V3.2.0 - 追加：管理者用一括更新関数 updateMember を実装。
 * V3.1.0 - 追加：deleteMember (物理レコード削除) を実装。
 * V3.0.0 - 修正：ステータス名称変更に対応 (new_req) および updateMemberStatus の引数型修正。
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

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member[], error: null };
};

/**
 * 承認待ち会員 (status: 'new_req') 一覧を取得する
 */
export const fetchPendingMembers = async (): Promise<ApiResponse<Member[]>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'new_req')
    .order('create_date', { ascending: true });

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member[], error: null };
};

/**
 * IDを指定して会員情報を取得する
 */
export const fetchMemberById = async (
  id: string
): Promise<ApiResponse<Member>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member, error: null };
};

/**
 * DUPR ID を指定して会員情報を取得する（一括更新用）
 * 同一 dupr_id が複数いる場合は更新せずエラーを返す（重複時は該当ユーザを更新しない）
 */
export const fetchMemberByDuprId = async (
  duprId: string
): Promise<ApiResponse<Member | null>> => {
  const trimmed = (duprId || '').trim();
  if (!trimmed) {
    return {
      success: true,
      data: null,
      error: null,
    };
  }
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('dupr_id', trimmed);

  if (error) {
    return handleError(error);
  }
  const arr = Array.isArray(data) ? data : [];
  if (arr.length === 0) {
    return { success: true, data: null, error: null };
  }
  if (arr.length > 1) {
    return {
      success: false,
      data: null,
      error: {
        message:
          '同一のDUPR IDが複数会員に登録されています。重複を解消してから再度実行してください。',
        code: 'DUPLICATE_DUPR_ID',
      },
    };
  }
  return { success: true, data: arr[0] as Member, error: null };
};

/**
 * メールアドレスを指定して会員情報を取得する
 */
export const fetchMemberByEmail = async (
  email: string
): Promise<ApiResponse<Member | null>> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member | null, error: null };
};

/**
 * ニックネームとメールアドレスを指定して会員情報を取得する（物理削除指定用）
 */
export const fetchMemberByNicknameAndEmail = async (
  nickname: string,
  email: string
): Promise<ApiResponse<Member | null>> => {
  const n = (nickname || '').trim();
  const e = (email || '').trim();
  if (!n || !e) {
    return {
      success: true,
      data: null,
      error: null,
    };
  }
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('nickname', n)
    .eq('email', e)
    .maybeSingle();

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member | null, error: null };
};

/**
 * ニックネームと会員番号を指定して会員情報を取得する（ゲスト登録時の紹介者照合用）
 * 会員番号は 1〜9999 を 4 桁ゼロパディングで照合する。
 */
export const fetchMemberByNicknameAndMemberNumber = async (
  nickname: string,
  memberNumber: string
): Promise<ApiResponse<Member | null>> => {
  const n = (nickname || '').trim();
  const raw = (memberNumber || '').trim();
  if (!n || !raw) {
    return {
      success: true,
      data: null,
      error: null,
    };
  }
  const num = parseInt(raw, 10);
  const normalized =
    !Number.isNaN(num) && num >= 1 && num <= 9999
      ? String(num).padStart(4, '0')
      : raw;

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('nickname', n)
    .eq('member_number', normalized)
    .maybeSingle();

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member | null, error: null };
};

/**
 * 新規会員登録 (初期ステータスは 'new_req')
 * members テーブルに存在しないカラム（例: introducer_member_number）は送信前に除外する。
 */
export const registerMember = async (
  member: MemberInput & { introducer_member_number?: string | null }
): Promise<ApiResponse<Member>> => {
  const { introducer_member_number: _omit, ...payload } = member;
  const { data, error } = await supabase
    .from('members')
    .insert([payload])
    .select()
    .single();

  if (error) {
    return handleError(error);
  }
  return { success: true, data: data as Member, error: null };
};

/**
 * 会員ステータスの更新
 */
export const updateMemberStatus = async (
  id: string,
  status: MemberStatus
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id);

  if (error) {
    return handleError(error);
  }
  return { success: true, data: null, error: null };
};

/**
 * 会員レコードの削除 (物理削除)
 */
export const deleteMember = async (
  id: string
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) {
    return handleError(error);
  }
  return { success: true, data: null, error: null };
};

/**
 * 他テーブルで会員IDが参照されているかチェックする（物理削除前の確認用）
 * announcements.author_id などを検索。参照ありの場合は削除しない旨のメッセージを返す。
 */
export interface MemberReferenceCheckResult {
  referenced: boolean;
  message?: string;
}

export const checkMemberReferenced = async (
  memberId: string
): Promise<ApiResponse<MemberReferenceCheckResult>> => {
  if (!memberId || !memberId.trim()) {
    return {
      success: true,
      data: { referenced: false },
      error: null,
    };
  }

  const { data: announcementsData, error: annError } = await supabase
    .from('announcements')
    .select('id')
    .eq('author_id', memberId.trim())
    .limit(1);

  if (annError) {
    return handleError(annError);
  }
  const hasAnnouncements =
    Array.isArray(announcementsData) && announcementsData.length > 0;
  if (hasAnnouncements) {
    return {
      success: true,
      data: {
        referenced: true,
        message:
          'お知らせの作成者として参照されています。削除できません。',
      },
      error: null,
    };
  }

  return {
    success: true,
    data: { referenced: false },
    error: null,
  };
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

  if (error) {
    return handleError(error);
  }
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

  if (error) {
    return handleError(error);
  }
  return { success: true, data: null, error: null };
};

/**
 * 会員情報の更新 (管理者用一括更新)
 * ステータス、メールアドレス、管理者編集項目などを一括で変更可能。
 */
export const updateMember = async (
  id: string,
  data: Partial<Member>
): Promise<ApiResponse<null>> => {
  const { error } = await supabase
    .from('members')
    .update(data)
    .eq('id', id);

  if (error) {
    return handleError(error);
  }
  return { success: true, data: null, error: null };
};

/**
 * DUPRデータの同期（外部APIから最新レートを取得）
 */
export async function syncDuprData(memberId: string) {
  try {
    const res = await fetch(`/api/members/${memberId}/dupr-sync`, {
      method: 'POST',
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('syncDuprData error:', error);
    return { 
      success: false, 
      error: '通信エラーが発生しました' 
    };
  }
}