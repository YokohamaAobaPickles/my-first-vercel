/**
 * Filename: announcements/page.tsx
 * Version : V1.4.0
 * Update  : 2026-01-25
 * 内容：
 * V1.4.0
 * - PCユーザー(LINE IDなし)対応: emailをキーに既読判定
 * - プロフィール画面への戻るリンクを追加
 * - レイアウトをダークモード、幅800px対応へ調整
 * V1.3.0
 * - useAuthCheckフックを導入し、認証・ロール取得ロジックを共通化
 * - 最新の auth.ts (V1.3.0) 権限判定に対応
 * V1.2.0
 * - 既読管理機能（announcement_reads）との連携を追加
 * - 未読記事はタイトルを太字(bold)、既読記事は通常(normal)で表示
 * V1.1.0
 * - canManageAnnouncements を使用して、管理者のみ「管理パネル」ボタンを表示
 * V1.0.0
 * - お知らせ一覧表示用。status='published' かつ publish_date が今日以前のものを抽出。
 * - is_pinned による固定表示と日付順ソートを実装。
 */

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementsPage() {
  const { 
    isLoading: isAuthLoading, 
    userRoles, 
    currentLineId, 
    user 
  } = useAuthCheck()
  
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [readIds, setReadIds] = useState<number[]>([])

  useEffect(() => {
    if (isAuthLoading) return

    const fetchData = async () => {
      // 公開中のお知らせを取得
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .lte('publish_date', new Date().toISOString().split('T')[0])
        .order('is_pinned', { ascending: false })
        .order('publish_date', { ascending: false })
      
      setAnnouncements(annData || [])

      // 既読情報の取得 (PC/LINE両対応のキー選択)
      const userKey = currentLineId || user?.email
      if (userKey) {
        const { data: readData } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('line_id', userKey)
        
        if (readData) {
          setReadIds(readData.map(r => r.announcement_id))
        }
      }
    }
    fetchData()
  }, [isAuthLoading, currentLineId, user])

  if (isAuthLoading) return <div style={containerStyle}>読み込み中...</div>

  return (
    <div style={containerStyle}>
      <div style={headerWrapperStyle}>
        <Link href="/members/profile" style={backLinkStyle}>
          ← トップに戻る
        </Link>
        {canManageAnnouncements(userRoles) && (
          <Link href="/announcements/admin" style={adminBtnStyle}>
            管理パネル
          </Link>
        )}
      </div>

      <h1 style={titleStyle}>お知らせ一覧</h1>

      {announcements.length === 0 ? (
        <p style={{ color: '#888' }}>現在お知らせはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {announcements.map((item) => {
            const isRead = readIds.includes(item.id)
            return (
              <li key={item.id} style={listItemStyle}>
                {item.is_pinned && <span style={pinStyle}>重要</span>}
                <div style={{ flex: 1 }}>
                  <Link 
                    href={`/announcements/${item.id}`} 
                    style={{
                      textDecoration: 'none',
                      color: isRead ? '#777' : '#4dabf7',
                      fontWeight: isRead ? 'normal' : 'bold',
                      fontSize: '1.05rem'
                    }}
                  >
                    {item.title}
                  </Link>
                  <div style={dateTextStyle}>
                    {item.publish_date} {isRead && '(既読済み)'}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// スタイル定義
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto'
}

const headerWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '25px',
  borderLeft: '4px solid #0070f3',
  paddingLeft: '15px'
}

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const adminBtnStyle: React.CSSProperties = {
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: 'bold'
}

const listItemStyle: React.CSSProperties = {
  borderBottom: '1px solid #222',
  padding: '16px 0',
  display: 'flex',
  alignItems: 'flex-start'
}

const pinStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4f',
  color: 'white',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.7rem',
  marginRight: '12px',
  marginTop: '4px'
}

const dateTextStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#666',
  marginTop: '6px'
}