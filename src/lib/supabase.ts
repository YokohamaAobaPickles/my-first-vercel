import { createClient } from '@supabase/supabase-js'

/**
 * Filename: lib/supabase.ts
 * Version : V1.0.0
 * Update  : 2026-01-15 
 * 内容：
 * V1.0.0
 * - supabaseアクセス共通ロジック
 */

// 環境変数からURLとKeyを読み込みます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアントを作成してエクスポートします
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
// 共通で使う「データ取得関数」サンプル作成時に作成した。
// 会員管理画面作成時に使うかもしれないのでコメントアウトとして残す
export async function fetchMembers() {
  const { data, error } = await supabase
    .from('members') // 実際にSupabaseに作ったテーブル名
    .select('*')
  
  if (error) {
    console.error('Supabaseエラー:', error)
    throw error
  }
  return data
}
*/