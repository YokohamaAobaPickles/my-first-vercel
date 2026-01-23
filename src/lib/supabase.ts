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
