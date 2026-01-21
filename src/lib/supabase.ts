import { createClient } from '@supabase/supabase-js'

// 環境変数からURLとKeyを読み込みます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアントを作成してエクスポートします
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 共通で使う「データ取得関数」もここに定義しておくと便利です
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