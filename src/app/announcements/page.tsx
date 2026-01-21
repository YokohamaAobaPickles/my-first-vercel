/**
 * Filename: announcements/page.tsx
 * Version : V1.0.0
 * Update  : 2026-01-21 
 * 修正内容：
 * V1.0.0
 * - お知らせ一覧表示用。
 * - status='published' かつ publish_date が今日以前のものを抽出。
 * - is_pinned による固定表示と日付順ソートを実装。
 */

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// お知らせの型定義
type Announcement = {
  id: number
  title: string
  publish_date: string
  is_pinned: boolean
  status: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, publish_date, is_pinned, status')
        .eq('status', 'published')             // 公開中のみ
        .lte('publish_date', today)           // 公開日を過ぎているもの
        .order('is_pinned', { ascending: false }) // ピン留め優先
        .order('publish_date', { ascending: false }) // 新しい順

      if (error) {
        console.error('Error fetching announcements:', error)
      } else {
        setAnnouncements(data || [])
      }
      setLoading(false)
    }

    fetchAnnouncements()
  }, [])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>お知らせ一覧</h1>

      {announcements.length === 0 ? (
        <p>現在お知らせはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {announcements.map((item) => (
            <li key={item.id} style={{
              borderBottom: '1px solid #eee',
              padding: '10px 0',
              display: 'flex',
              alignItems: 'center'
            }}>
              {item.is_pinned && (
                <span style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  marginRight: '8px'
                }}>重要</span>
              )}
              <div style={{ flex: 1 }}>
                <Link href={`/announcements/${item.id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
                  {item.title}
                </Link>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {item.publish_date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link href="/">トップへ戻る</Link>
      </div>
    </div>
  )
}