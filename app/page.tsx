export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>会員管理アプリ開発スタート！</h1>
      <p>Vercelへのデプロイと、コードの書き換えに成功しました。</p>
      
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>今後の予定</h2>
        <ul>
          <li>LINE Messaging APIとの連携</li>
          <li>Supabaseで会員データの読み書き</li>
          <li>会計管理ロジックの移植</li>
        </ul>
      </div>
    </div>
  );
}