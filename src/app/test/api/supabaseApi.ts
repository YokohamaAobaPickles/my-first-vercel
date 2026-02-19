/**
 * Filename: supabaseApi.ts
 * Version: V1.0.0
 * Update: 2026-02-19
 * Remarks: V1.0.0 - テスト用：メンバー一覧取得・画像ストレージ操作・DB更新関数群
 */
import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'avatars';

// メンバー一覧を取得する関数
export const fetchMembersForTest = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, nickname, profile_icon_url')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
};

// 指定メンバーの画像をストレージに書き込み、URLをDBに保存する一連の処理
export const uploadProfileIcon = async (memberId: string, file: File) => {
  const filePath = `${memberId}/icon_${Date.now()}.png`;

  // 1. ストレージにアップロード
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // 2. 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // 3. membersテーブルのprofile_icon_urlを更新
  const { error: dbError } = await supabase
    .from('members')
    .update({ profile_icon_url: publicUrl })
    .eq('id', memberId);

  if (dbError) throw dbError;
  return publicUrl;
};

// 指定メンバーの画像をストレージから削除し、DBのURLをクリアする
export const deleteProfileIcon = async (memberId: string, currentUrl: string | null) => {
  if (currentUrl) {
    // URLからパスを抽出してストレージから削除（簡易実装）
    const path = currentUrl.split(`${BUCKET_NAME}/`)[1];
    if (path) {
      await supabase.storage.from(BUCKET_NAME).remove([path]);
    }
  }

  // DBのURLをnullで更新（クリア）
  const { error } = await supabase
    .from('members')
    .update({ profile_icon_url: null })
    .eq('id', memberId);

  if (error) throw error;
};