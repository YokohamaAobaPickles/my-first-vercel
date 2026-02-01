/**
 * Filename: src/utils/memberHelpers.ts
 * Version : V2.1.0
 * Update  : 2026-01-27
 * * 内容：
 * - 会員関連のビジネスロジック・バリデーション・加工関数。
 * - V2.1.0 変更点:
 * 1. Supabase (DB) への直接アクセスを memberApi.ts へ完全移管し、依存を排除。
 * 2. 引数の型を RegistrationData から MemberInput へ変更。
 * 3. メールアドレス形式チェック等のバリデーション強化。
 */

import { MemberInput } from '@/types/member';

/**
 * 会員登録・編集時のバリデーション
 * * @param data - 入力された会員データ (MemberInput)
 * @returns { isValid: boolean, errors: string[] }
 */
export const validateRegistration = (
  data: Partial<MemberInput> & {
    introducer?: string | null;
    introducer_member_number?: string | null;
  }
) => {
  const errors: string[] = [];

  // 1. 氏名の必須チェック（トリム処理込み）
  if (!data.name?.trim()) {
    errors.push('氏名を入力してください');
  }

  // 2. メールアドレス必須（一般・ゲストいずれも登録必須）
  if (!data.email?.trim()) {
    errors.push('メールアドレスを入力してください');
  } else if (!data.email.includes('@')) {
    errors.push('有効なメールアドレスを入力してください');
  }

  // 3. 緊急連絡先電話番号の必須チェック
  if (!data.emg_tel?.trim()) {
    errors.push('緊急連絡先電話番号を入力してください');
  }

  // 4. ゲスト登録時：紹介者ニックネーム・会員番号の必須チェック
  const isGuest = (data as { member_kind?: string }).member_kind === 'guest';
  if (isGuest) {
    if (!data.introducer || !data.introducer.trim()) {
      errors.push('紹介者のニックネームを入力してください');
    }
    if (!data.introducer_member_number?.trim()) {
      errors.push('紹介者の会員番号を入力してください');
    }
  }

  // 5. Case B: PC/スマホ版 (LINE連携なし) でのニックネーム必須チェック
  // LINE ID が紐付いていない場合は、識別子としてニックネームを必須とする
  if (!data.line_id && !data.nickname?.trim()) {
    errors.push('PC版からの登録にはニックネームが必要です');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 在籍日数の計算
 * * @param createDate - 会員登録日 (ISO 8601文字列形式)
 * @returns number (日数) | "-" (未登録時)
 */
export const calculateEnrollmentDays = (
  createDate?: string | null
): number | string => {
  if (!createDate) return '-';

  const start = new Date(createDate);
  const today = new Date();

  // 精度を「日」単位に合わせるため、UTCで時刻を00:00:00に固定して計算
  const startDate = Date.UTC(
    start.getFullYear(), 
    start.getMonth(), 
    start.getDate()
  );
  const todayDate = Date.UTC(
    today.getFullYear(), 
    today.getMonth(), 
    today.getDate()
  );

  const diffTime = todayDate - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 登録直後は0、未来日付が入った場合もガードロジックで0を返す
  return diffDays > 0 ? diffDays : 0;
};

/**
 * ニックネームの重複チェック（ロジック層）
 * * @param nickname - チェック対象のニックネーム
 * @param checkFn - 外部 (API層) から注入される問い合わせ用非同期関数
 * @returns Promise<boolean> (重複ありの場合 true)
 */
export const isNicknameDuplicate = async (
  nickname: string,
  checkFn: (nick: string) => Promise<boolean>
): Promise<boolean> => {
  // 入力が空、またはスペースのみの場合はチェック不要（APIを叩かない）
  if (!nickname || !nickname.trim()) return false;
  
  return await checkFn(nickname);
};

/**
 * 名前を表示用に整形
 * * @param name - 氏名
 * @returns トリム後の氏名、または「未登録」
 */
export const formatMemberName = (name: string | null) => {
  return name ? name.trim() : '未登録';
};