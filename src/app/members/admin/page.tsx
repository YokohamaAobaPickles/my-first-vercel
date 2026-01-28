/**
 * Filename: src/app/members/admin/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-26
 * 履歴:
 * V1.3.0 - 永続化対応。fetchPendingMembers API を使用し実データ連携を実装。
 * ローディング状態（isDataFetching）の制御を追加。
 * V1.2.0 - useAuthCheck フックによる管理者権限ガードを実装。
 * V1.1.0 - モックデータによる承認待ち一覧のUIプロトタイプ作成。
 * V1.0.0 - 初回作成。
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { fetchPendingMembers } from '@/lib/memberApi'

// 会員の型定義（将来的に types/index.ts 等に移行も検討）
interface Member {
  id: string;
  name: string;
  roles: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuthCheck()

  // 状態管理
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [isDataFetching, setIsDataFetching] = useState(true)

  useEffect(() => {
    // 認証チェックが終わるまで待機
    if (isAuthLoading) return

    // 権限チェック：会員管理権限がない場合はトップページへ
    if (!user || !canManageMembers(user.roles)) {
      router.replace('/')
      return
    }

    /**
     * 実データの取得処理
     */
    const loadData = async () => {
      try {
        const res = await fetchPendingMembers() // 変数名を res (response) にすると分かりやすいです
        if (res.success && res.data) {
          setPendingMembers(res.data) // ApiResponse の中の data (Member[]) をセット
        } else {
          // 必要に応じてエラーハンドリング
          console.error(res.error?.message)
        }
      } catch (err) {
        console.error('データ取得に失敗しました:', err)
      } finally {
        setIsDataFetching(false)
      }
    }

    loadData()
  }, [user, isAuthLoading, router])

  // 読み込み中の表示（認証またはデータ取得）
  if (isAuthLoading || isDataFetching) {
    return (
      <div style={containerStyle}>
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>会員管理ダッシュボード</h1>

      {/* 承認待ちセクション */}
      <section style={sectionStyle}>
        <h2 style={subTitleStyle}>承認待ち会員</h2>

        {pendingMembers.length === 0 ? (
          <p style={emptyMessageStyle}>現在、承認待ちの会員はいません。</p>
        ) : (
          <div style={listStyle}>
            {pendingMembers.map((member) => (
              <div key={member.id} style={cardStyle}>
                <div style={infoStyle}>
                  <span style={nameStyle}>{member.name}</span>
                  <span style={roleBadgeStyle}>{member.roles}</span>
                </div>
                <Link
                  href={`/members/admin/${member.id}`}
                  style={detailButtonStyle}
                >
                  詳細・承認
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ナビゲーション */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/members/profile" style={backLinkStyle}>
          自分のプロフィールに戻る
        </Link>
      </div>
    </div>
  )
}

// --- スタイル定義（ワードラップを考慮し整理） ---
const containerStyle: React.CSSProperties = {
  padding: '40px 20px',
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  maxWidth: '800px',
  margin: '0 auto'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  marginBottom: '40px',
  textAlign: 'center',
  fontWeight: 'bold'
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #333'
}

const subTitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  marginBottom: '20px',
  borderLeft: '4px solid #ff4d4f',
  paddingLeft: '15px',
  color: '#ff4d4f'
}

const emptyMessageStyle: React.CSSProperties = {
  color: '#888',
  textAlign: 'center',
  padding: '40px 0'
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: '#1a1a1a',
  borderRadius: '10px',
  border: '1px solid #222'
}

const infoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
}

const nameStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '1.05rem'
}

const roleBadgeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  backgroundColor: '#333',
  padding: '2px 8px',
  borderRadius: '4px',
  color: '#aaa'
}

const detailButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#fff',
  color: '#000',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: 'bold'
}

const backLinkStyle: React.CSSProperties = {
  color: '#888',
  textDecoration: 'none',
  fontSize: '0.9rem'
}