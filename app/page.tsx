import { createClient } from '@supabase/supabase-js'

// 先ほど登録した環境変数を読み込みます
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  // 例：'users' というテーブルからデータを取得してみる
  // ※実際のテーブル名に合わせて書き換えてください（例: 'members' など）
  const { data: members, error } = await supabase
    .from('members') // ここをお使いのテーブル名に変えてください
    .select('*')

  return (
    <div style={{ padding: "40px" }}>
      <h1>Supabase 接続テスト</h1>
      {error && <p style={{ color: "red" }}>エラー発生: {error.message}</p>}
      {!error && (
        <p>現在、{members?.length || 0} 名の会員データが取得できました！</p>
      )}
    </div>
  )
}