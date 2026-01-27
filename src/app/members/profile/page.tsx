/**
 * Filename: members/profile/page.tsx
 * Version : V1.4.2
 * Update  : 2026-01-26
 * 修正内容：
 * V1.4.2
 * - 会員管理権限(4者)保持者向けに「会員管理パネル」へのリンクを実装
 * - canManageMembers 判定ロジックによる表示制御を追加
 * V1.3.0
 * - 未登録ユーザー時のログイン画面リダイレクト処理を追加
 * - 1プロパティ1行のルール適用、スタイル定義の整理
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { 
    user, 
    isLoading, 
    currentLineId 
  } = useAuthCheck()

  // 読み込み中の表示
  if (isLoading) {
    return (
      <div style={containerStyle}>
        読み込み中...
      </div>
    )
  }

  // LINE認証済だがDB未登録の場合はログイン画面へ
  if (!user && currentLineId) {
    router.replace('/members/login')
    return null
  }

  // 未ログイン・未認証状態
  if (!user) {
    return (
      <div style={containerStyle}>
        認証を確認しています...
      </div>
    )
  }

  // 管理権限（会長・副会長・会員担当・システム管理者）の有無を判定
  const hasAdminAccess = canManageMembers(user.roles)

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={titleStyle}>
          マイプロフィール
        </h1>
        
        {/* --- 管理者専用メニュー --- */}
        {hasAdminAccess && (
          <div style={adminSectionStyle}>
            <p style={adminLabelStyle}>
              管理者メニュー
            </p>
            <Link 
              href="/admin/dashboard" 
              style={adminButtonStyle}
            >
              ⚙️ 会員管理パネル
            </Link>
          </div>
        )}

        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={labelStyle}>氏名</span>
            <span style={valueStyle}>
              {user.name}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>ニックネーム</span>
            <span style={valueStyle}>
              {user.nickname}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>会員番号</span>
            <span style={valueStyle}>
              {user.member_number || '未発行'}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>種別</span>
            <span style={valueStyle}>
              {user.member_kind}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>ステータス</span>
            <span style={statusValueStyle(user.status)}>
              {user.status === 'active' ? '有効' : '利用停止'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link 
            href="/" 
            style={backLinkStyle}
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

// --- スタイル定義（1プロパティ1行） ---
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 20px',
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '30px',
  textAlign: 'center'
}

const adminSectionStyle: React.CSSProperties = {
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: '#1a1a1a',
  border: '1px solid #ff4d4f',
  borderRadius: '12px'
}

const adminLabelStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '0.8rem',
  color: '#ff4d4f',
  fontWeight: 'bold'
}

const adminButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 20px',
  backgroundColor: '#ff4d4f',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: 'bold'
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#111',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #333',
  width: '100%',
  boxSizing: 'border-box'
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid #222'
}

const labelStyle: React.CSSProperties = {
  color: '#888',
  fontSize: '0.9rem'
}

const valueStyle: React.CSSProperties = {
  fontWeight: '500'
}

const statusValueStyle = (status: string): React.CSSProperties => ({
  fontWeight: 'bold',
  color: status === 'active' ? '#52c41a' : '#ff4d4f'
})

const backLinkStyle: React.CSSProperties = {
  color: '#0070f3',
  textDecoration: 'none',
  fontSize: '0.9rem'
}