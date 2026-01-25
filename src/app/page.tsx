/**
 * Filename: members/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-25
 * 修正内容：
 * V1.3.0
 * - 古いLIFF/Supabase直接取得ロジックを廃止し、useAuthCheckに完全移行
 * - 未登録時にエラーを出すのではなく、ログイン画面へ自動遷移するよう修正
 * - 80文字ワードラップ、スタイル1行記述、複数条件の改行を適用
 * V1.2.1
 * - JSXのタグ構造ミスを修正
 * V1.1.0
 * - プロファイルの表示、権限管理対応
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { 
    user, 
    isLoading, 
    currentLineId 
  } = useAuthCheck()

  useEffect(() => {
    // 判定条件を改行して明確化
    if (
      !isLoading && 
      !user && 
      currentLineId
    ) {
      // 未登録ユーザーはログイン/登録画面へ強制移動
      router.replace('/members/login')
    }
  }, [
    user, 
    isLoading, 
    currentLineId, 
    router
  ])

  // ロード中、またはリダイレクト待機中
  if (
    isLoading || 
    (
      currentLineId && 
      !user
    )
  ) {
    return (
      <div 
        style={{ 
          padding: '20px', 
          backgroundColor: '#000', 
          color: '#fff', 
          minHeight: '100vh' 
        }}
      >
        読み込み中...
      </div>
    )
  }

  // ログインしていない、またはデータがない場合（リダイレクト待ち）
  if (!user) {
    return (
      <div 
        style={{ 
          backgroundColor: '#000', 
          minHeight: '100vh' 
        }} 
      />
    )
  }

  // --- スタイル定義 (1プロパティ1行) ---
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    color: '#fff',
    backgroundColor: '#000',
    minHeight: '100vh',
  }

  const cardStyle: React.CSSProperties = {
    border: '1px solid #333',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#111',
    marginBottom: '20px',
  }

  const adminMenuStyle: React.CSSProperties = {
    padding: '15px',
    backgroundColor: '#000',
    border: '1px solid #ffe58f',
    borderRadius: '8px',
    marginBottom: '20px',
  }

  return (
    <div style={containerStyle}>
      <h1 
        style={{ 
          fontSize: '1.5rem', 
          marginBottom: '20px' 
        }}
      >
        マイページ
      </h1>

      <div style={cardStyle}>
        <div 
          style={{ 
            marginBottom: '15px' 
          }}
        >
          <label 
            style={{ 
              fontSize: '0.8rem', 
              color: '#888' 
            }}
          >
            氏名
          </label>
          <div 
            style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}
          >
            {user.name} ({user.nickname})
          </div>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px' 
          }}
        >
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>
              会員番号
            </label>
            <div>
              {user.member_number || '未発行'}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>
              会員種別
            </label>
            <div>
              {user.member_kind}
            </div>
          </div>
        </div>
      </div>

      {/* 管理者メニュー判定の改行表示 */}
      {canManageMembers(
        user?.roles || 
        null
      ) && (
        <div style={adminMenuStyle}>
          <p 
            style={{ 
              fontWeight: 'bold', 
              color: '#ffe58f', 
              marginTop: 0 
            }}
          >
            管理者メニュー
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>
              <Link 
                href="/members/admin" 
                style={{ color: '#0070f3' }}
              >
                会員管理
              </Link>
            </li>
          </ul>
        </div>
      )}

      <div>
        <Link 
          href="/announcements" 
          style={{ color: '#aaa' }}
        >
          お知らせ一覧へ
        </Link>
      </div>
    </div>
  )
}