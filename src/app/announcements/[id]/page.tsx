/**
 * Filename: announcements/[id]/page.tsx
 * Version : V1.4.0
 * Update  : 2026-01-25
 * 内容：
 * V1.4.0
 * - PCユーザー(LINE IDなし)でもemailをキーに既読記録を可能に修正
 * - ダークモードレイアウトへの適合
 * V1.3.0
 * - hookAuthCheck対応
 * V1.2.1
 * - 既読記録の修正。デバッグ用コンソール文追加
 * V1.2.0
 * - 既読記録の追加
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementDetailPage() {
  const { id } = useParams()
  const { 
    isLoading: isAuthLoading, 
    userRoles, 
    currentLineId, 
    user 
  } = useAuthCheck()
  
  const [announcement, setAnnouncement] = useState<any>(null)

  useEffect(() => {
    if (isAuthLoading || !id) return

    const fetchAndRecord = async () => {
      // 1. 記事本体の取得
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setAnnouncement(data)

      // 2. 既読の記録
      const userKey = currentLineId || user?.email
      if (userKey) {
        await supabase.from('announcement_reads').upsert({
          announcement_id: Number(id),
          line_id: userKey,
          read_at: new Date().toISOString()
        }, { 
          onConflict: 'announcement_id, line_id' 
        })
      }
    }
    fetchAndRecord()
  }, [isAuthLoading, currentLineId, user, id])

  if (isAuthLoading || !announcement) {
    return <div style={containerStyle}>読み込み中...</div>
  }

  return (
    <div style={containerStyle}>
      <div style={navWrapperStyle}>
        <Link href="/announcements" style={backLinkStyle}>
          ← 記事一覧に戻る
        </Link>
        {canManageAnnouncements(userRoles) && (
          <Link 
            href={`/announcements/edit/${announcement.id}`} 
            style={editBtnStyle}
          >
            編集
          </Link>
        )}
      </div>

      <div style={contentCardStyle}>
        <div style={dateLabelStyle}>{announcement.publish_date}</div>
        <h1 style={detailTitleStyle}>{announcement.title}</h1>
        <hr style={dividerStyle} />
        <div style={bodyTextStyle}>
          {announcement.content}
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto'
}

const navWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px'
}

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const editBtnStyle: React.CSSProperties = {
  backgroundColor: '#222',
  color: '#fff',
  padding: '8px 18px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  border: '1px solid #444',
  textDecoration: 'none'
}

const contentCardStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #222'
}

const dateLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#666',
  marginBottom: '10px'
}

const detailTitleStyle: React.CSSProperties = {
  fontSize: '1.6rem',
  lineHeight: '1.4',
  marginBottom: '20px'
}

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #333',
  margin: '20px 0'
}

const bodyTextStyle: React.CSSProperties = {
  lineHeight: '1.8',
  whiteSpace: 'pre-wrap',
  fontSize: '1.1rem',
  color: '#ddd'
}