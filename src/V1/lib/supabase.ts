/**
 * Filename: lib/supabase.ts
 * Version : V1.0.1
 * Update  : 2026-01-25
 * 内容：
 * V1.0.1
 * -テスト環境で環境変数がなくてもエラーにならないようフォールバックを追加
 * V1.0.0
 * - supabaseアクセス共通ロジック
 */

import { createClient } from '@supabase/supabase-js'

// 環境変数からURLとKeyを読み込む
// 環境変数がない場合はダミー文字列を入れることで、テスト実行時のクラッシュを防ぐ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'

// Supabaseクライアントを作成してエクスポートする
export const supabase = createClient(supabaseUrl, supabaseAnonKey)