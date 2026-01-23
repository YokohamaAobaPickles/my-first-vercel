/**
 * Filename: announcements/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-22 
 * 内容：
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

type Announcement = {
  id: number
  title: string
  publish_date: string
  is_pinned: boolean
  status: string
}

export default function AnnouncementsPage() {
  const { isLoading: isAuthLoading, userRoles, currentLineId } = useAuthCheck()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [readIds, setReadIds] = useState<number[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading || !currentLineId) return

    const fetchInitialData = async () => {
      try {
        const { data: readData } = await supabase
          .from('announcement_reads')
          .select('announcement_id')
          .eq('user_id', currentLineId)

        if (readData) {
          setReadIds(readData.map(r => Number(r.announcement_id)))
        }

        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, publish_date, is_pinned, status')
          .eq('status', 'published')
          .lte('publish_date', today)
          .order('is_pinned', { ascending: false })
          .order('publish_date', { ascending: false })

        if (!error) setAnnouncements(data || [])
      } catch (err) {
        console.error('Data fetching error:', err)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchInitialData()
  }, [isAuthLoading, currentLineId])

  if (isAuthLoading || isDataLoading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>お知らせ一覧</h1>
        {canManageAnnouncements(userRoles) && (
          <Link href="/announcements/admin" style={{
            backgroundColor: '#0070f3', color: 'white', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold'
          }}>
            管理パネル
          </Link>
        )}
      </div>

      {announcements.length === 0 ? <p>現在お知らせはありません。</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {announcements.map((item) => (
            <li key={item.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', alignItems: 'center' }}>
              {item.is_pinned && <span style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', marginRight: '8px' }}>重要</span>}
              <div style={{ flex: 1 }}>
                <Link href={`/announcements/${item.id}`} style={{
                  textDecoration: 'none', color: readIds.includes(item.id) ? '#555' : '#0070f3', fontWeight: readIds.includes(item.id) ? 'normal' : 'bold', fontSize: '1rem'
                }}>
                  {item.title}
                </Link>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>{item.publish_date}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}