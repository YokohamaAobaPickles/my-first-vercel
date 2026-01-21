import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>横浜青葉ピックルズ 管理システム</h1>
      <p>ようこそ！メニューを選択してください。</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link href="/members" style={{
          padding: '10px 20px',
          background: '#0070f3',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none'
        }}>
          会員一覧を見る
        </Link>
      </div>
    </div>
  )
}