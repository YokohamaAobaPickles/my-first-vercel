/**
 * Filename: utils/memberHelpers.ts
 * Version : V1.0.0
 * Update： 2026-01-23
 * 内容：
 * V1.0.0
 * 会員管理に関する純粋なロジック関数群
 */

export type RegistrationData = {
  line_id?: string | null
  nickname?: string
  email: string
  name: string
  name_roma: string
  password?: string
  emg_tel: string
  emg_rel: string
  req_date?: string; // ★ これを追加
}

export const validateRegistration = (data: RegistrationData) => {
  const errors: string[] = []

  // 1. 共通必須チェック
  if (!data.name?.trim()) errors.push('氏名は必須です')
  if (!data.name_roma?.trim()) errors.push('氏名（ローマ字）は必須です')
  if (!data.email?.trim()) errors.push('メールアドレスは必須です')
  if (!data.password || data.password.length < 6) errors.push('パスワードは6文字以上必要です')
  if (!data.emg_tel?.trim() || !data.emg_rel?.trim()) errors.push('緊急連絡先は必須です')

  // 緊急連絡先チェック
  if (!data.emg_tel?.trim() || !data.emg_rel?.trim()) {
    errors.push('緊急連絡先は必須です')
  }

  // 2. PC版固有チェック（line_idがない場合はPC版とみなす）
  const isPcMode = !data.line_id
  if (isPcMode && !data.nickname?.trim()) {
    errors.push('PC版からの登録にはニックネームが必要です')
  }
  return {
    isValid: errors.length === 0,
    errors
  }
};

/**
 * ニックネームが既に使用されているかチェックする
 * @param nickname 入力されたニックネーム
 * @param checkFn Supabase等への問い合わせ関数（テスト時に差し替え可能にする）
 */
export const isNicknameDuplicate = async (
  nickname: string,
  checkFn: (nick: string) => Promise<boolean>
): Promise<boolean> => {
  if (!nickname) return false;
  return await checkFn(nickname);
};

// 実際の画面で使用するSupabase問い合わせ用関数
export const checkNicknameInSupabase = async (nickname: string): Promise<boolean> => {
  const { supabase } = await import('@/lib/supabase'); // 動的インポート
  const { data, error } = await supabase
    .from('members')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle();
  
  return !!data; // データがあれば重複(true)
};

/**
 * 会員一覧を取得する (管理者用)
 * A-31 仕様に基づき、会員番号順に取得
 */
export const fetchMembers = async () => {
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('member_number', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * 名前を表示用に整形するロジック（新定義）
 * 氏名がない場合のフォールバックなどを共通化
 */
export const formatMemberName = (name: string | null) => {
  return name ? name.trim() : '未登録';
};