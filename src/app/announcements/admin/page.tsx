/**
 * Filename: announcements/admin/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-25
 * 内容：
 * V1.3.0
 * - 一般向け「記事一覧に戻る」リンクを追加
 * - レイアウトをダークモード(800px)へ調整
 * V1.2.0
 * - useAuthCheck対応版
 * V1.1.0
 * - 各記事の既読者数（👀）を表示する機能を追加
 */

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementAdminPage() {
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [readCounts, setReadCounts] = useState<{[key: number]: number}>({})

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return

    const fetchData = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('publish_date', { ascending: false })
      setAnnouncements(data || [])

      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
      
      if (reads) {
        const counts: any = {}
        reads.forEach(r => {
          counts[r.announcement_id] = (counts[r.announcement_id] || 0) + 1
        })
        setReadCounts(counts)
      }
    }
    fetchData()
  }, [isAuthLoading, userRoles])

  if (isAuthLoading) return <div style={containerStyle}>読み込み中...</div>
  if (!canManageAnnouncements(userRoles)) {
    return <div style={containerStyle}>権限がありません</div>
  }

  return (
    <div style={containerStyle}>
      <div style={navWrapperStyle}>
        <Link href="/announcements" style={backLinkStyle}>
          ← 記事一覧に戻る
        </Link>
        <Link href="/announcements/new" style={newBtnStyle}>
          + 新規作成
        </Link>
      </div>

      <h2 style={titleStyle}>お知らせ管理 (管理者用)</h2>

      {announcements.map(ann => (
        <div key={ann.id} style={adminCardStyle}>
          <div style={{ flex: 1 }}>
            <div style={statusBadgeStyle(ann.status)}>
              {ann.status === 'published' ? '公開中' : '下書き/無効'}
            </div>
            <div style={cardTitleStyle}>{ann.title}</div>
            <div style={cardMetaStyle}>{ann.publish_date}</div>
          </div>
          
          <div style={actionGroupStyle}>
            <Link 
              href={`/announcements/admin/${ann.id}`} 
              style={readCountLinkStyle}
            >
              👀 {readCounts[ann.id] || 0}
            </Link>
            <Link 
              href={`/announcements/edit/${ann.id}`} 
              style={editLinkStyle}
            >
              編集
            </Link>
          </div>
        </div>
      ))}
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

const navWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
}

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const newBtnStyle: React.CSSProperties = {
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 'bold'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  marginBottom: '20px'
}

const adminCardStyle: React.CSSProperties = {
  border: '1px solid #222',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#111'
}

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  fontSize: '0.7rem',
  color: status === 'published' ? '#4caf50' : '#888',
  marginBottom: '4px'
})

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  marginBottom: '4px'
}

const cardMetaStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#666'
}

const actionGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
}

const readCountLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#aaa',
  fontSize: '0.9rem',
  backgroundColor: '#222',
  padding: '4px 8px',
  borderRadius: '6px'
}

const editLinkStyle: React.CSSProperties = {
  color: '#0070f3',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 'bold'
}