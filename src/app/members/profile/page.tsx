/**
 * Filename: members/profile/page.tsx
 * Version : V1.2.2
 * Update  : 2026-01-25
 * 修正内容：
 * V1.2.2
 * - 未登録ユーザー（user === null）時にエラー画面を出さず、
 * ログイン画面へ再誘導するようガードロジックを修正
 * - 80文字ワードラップ、スタイル1行記述、条件判定の改行を適用
 * V1.2.1
 * - タイポ修正およびスタイル適用
 * V1.2.0
 * - useAuthCheck を導入し、独自の認証・データ取得ロジックを廃止
 * - 未登録ユーザー時に「会員情報が見つからない」エラー画面が出る不具合を修正
 * V1.1.2
 * - liff.login のリダイレクト先を明示的に指定
 * V1.1.1
 * - liff.login に redirectUri を追加
 * V1.1.0
 * - ログイン後のマイページ表示、氏名、種別、役割、ステータス表示に対応
 */

'use client'

import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { 
    user, 
    isLoading, 
    currentLineId 
  } = useAuthCheck()

  // ユーザーデータがなく、読み込みが終わっている場合の遷移制御
  useEffect(() => {
    if (
      !isLoading && 
      !user && 
      currentLineId
    ) {
      // LINE IDはあるがDBにない＝新規登録が必要。ログイン画面へ。
      router.replace('/members/login')
    }
  }, [
    user, 
    isLoading, 
    currentLineId, 
    router
  ])

  // 1. 読み込み中、または未登録ユーザーのリダイレクト待機中
  if (
    isLoading || 
    (
      !user && 
      currentLineId
    )
  ) {
    return (
      <div 
        style={{ 
          padding: '20px', 
          color: '#fff', 
          backgroundColor: '#000', 
          minHeight: '100vh' 
        }}
      >
        読み込み中...
      </div>
    )
  }

  // 2. LINE ID も ユーザー情報 もない場合（直接アクセス等）
  if (!user) {
    return (
      <div 
        style={{ 
          padding: '20px', 
          color: '#fff', 
          backgroundColor: '#000', 
          minHeight: '100vh' 
        }}
      >
        認証を確認しています...
      </div>
    )
  }

  // --- スタイル定義 (1プロパティ1行) ---
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
  }

  const cardStyle: React.CSSProperties = {
    padding: '20px',
    border: '1px solid #333',
    borderRadius: '12px',
    backgroundColor: '#111',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#888',
  }

  const dataValueStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  }

  return (
    <div style={containerStyle}>
      <h1 
        style={{ 
          marginBottom: '20px' 
        }}
      >
        マイプロフィール
      </h1>
      
      <div style={cardStyle}>
        <div 
          style={{ 
            marginBottom: '15px' 
          }}
        >
          <label style={labelStyle}>
            氏名
          </label>
          <div style={dataValueStyle}>
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
            <label style={labelStyle}>
              会員番号
            </label>
            <div>
              {user.member_number || '未発行'}
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              会員種別
            </label>
            <div>
              {user.member_kind}
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              役割
            </label>
            <div>
              {user.roles}
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              ステータス
            </label>
            <div
              style={{
                color: user.status === 'active' 
                  ? 'green' 
                  : 'orange',
                fontWeight: 'bold',
              }}
            >
              {user.status === 'active' 
                ? '有効' 
                : user.status}
            </div>
          </div>
        </div>
      </div>

      <div 
        style={{ 
          marginTop: '20px' 
        }}
      >
        <Link 
          href="/announcements" 
          style={{ 
            color: '#0070f3' 
          }}
        >
          お知らせへ戻る
        </Link>
      </div>
    </div>
  )
}