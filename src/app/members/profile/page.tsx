/**
 * Filename: members/profile/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-25
 * 修正内容：
 * V1.2.0
 * - useAuthCheck を導入し、独自の認証・データ取得ロジックを廃止（重複を解消）
 * - 未登録ユーザー時に「会員情報が見つからない」エラー画面が出る不具合を修正
 * V1.1.2
 * - liff.login のリダイレクト先を明示的に指定
 * V1.1.1
 * - liff.login に redirectUri を追加し、ローカル開発中に本番へ飛ばされる問題を修正
 * V1.1.0
 * - ログイン後のマイページ(プロファイル)表示
 * - membersテーブルからLINE IDをキーに会員情報を取得
 * - 氏名、会員種別、役割、ステータスの表示に対応
 */

'use client'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import Link from 'next/link'

export default function ProfilePage() {
  // useAuthCheck ですべての認証とデータ取得を一元管理
  const { user, isLoading } = useAuthCheck()

  // 1. 認証チェック中またはデータ取得中はローディングを表示
  if (isLoading) {
    return <div style={{ padding: '20px' }}>読み込み中...</div>
  }

  // 2. ユーザーデータがない場合
  // (通常は useAuthCheck 内で /members/login へリダイレクトされる)
  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        認証を確認しています...
      </div>
    )
  }

  // 3. 正常な表示（V1.1.0 で構築したスタイルを維持）
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>マイページ</h1>

      <div style={{
        border: '1px solid #eee',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.8rem', color: '#888' }}>氏名</label>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {user.name} ({user.nickname})
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>会員番号</label>
            <div>{user.member_number || '未発行'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>会員種別</label>
            <div>{user.member_kind}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>役割</label>
            <div>{user.roles}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>ステータス</label>
            <span style={{
              color: user.status === 'active' ? 'green' : 'orange',
              fontWeight: 'bold'
            }}>
              {user.status === 'active' ? '有効' : user.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link href="/announcements" style={{ color: '#0070f3' }}>お知らせ一覧を見る</Link>
        <Link href="/" style={{ color: '#666' }}>トップへ戻る</Link>
      </div>
    </div>
  )
}