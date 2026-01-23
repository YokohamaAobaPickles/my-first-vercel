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
  req_date?: string;
  status?: 'member' | 'guest';
  introducer?: string;
}

export const validateRegistration = (data: RegistrationData) => {
  const errors: string[] = []

  // 1. 共通必須チェック (文言をテストに合わせる)
  if (!data.name?.trim()) errors.push('氏名を入力してください')
  if (!data.name_roma?.trim()) errors.push('氏名（ローマ字）を入力してください')
  if (!data.email?.trim()) errors.push('メールアドレスを入力してください')
  if (!data.password || data.password.length < 6) {
    errors.push('パスワードは6文字以上で入力してください')
  }
  
  if (!data.emg_tel?.trim()) errors.push('緊急連絡先電話番号を入力してください')
  if (!data.emg_rel?.trim()) errors.push('緊急連絡先との続柄を入力してください')

  // 2. Case C: ゲスト特有のチェック
  if (data.status === 'guest') {
    if (!data.introducer || !data.introducer.trim()) {
      errors.push('紹介者のニックネームを入力してください')
    }
  }

  // 3. Case B: ブラウザ(PC/スマホ)版特有のチェック
  // LINE IDがない場合は、ゲストであってもニックネームが必要です
  if (!data.line_id && !data.nickname?.trim()) {
    errors.push('PC版からの登録にはニックネームが必要です')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

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

/**
 * 指定されたメールアドレスのユーザー情報を取得する
 * (パスワード照合や既存チェックに使用)
 */
export const getMemberByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116は「0件」のエラーコード
    console.error('Error fetching member by email:', error)
    return null
  }
  return data || null
}

/**
 * LINE IDを既存レコードに紐付ける (Case Aでのアカウント統合用)
 */
export const linkLineIdToMember = async (email: string, lineId: string) => {
  const { error } = await supabase
    .from('members')
    .update({ line_id: lineId })
    .eq('email', email)
  
  return { success: !error, error }
}