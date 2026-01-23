/**
 * Filename: announcements/admin/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-22
 * 内容：
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
  const [readCounts, setReadCounts] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return

    const fetchData = async () => {
      const { data } = await supabase.from('announcements').select('*').order('publish_date', { ascending: false })
      setAnnouncements(data || [])

      const { data: reads } = await supabase.from('announcement_reads').select('announcement_id')
      if (reads) {
        const counts: any = {}
        reads.forEach(r => counts[r.announcement_id] = (counts[r.announcement_id] || 0) + 1)
        setReadCounts(counts)
      }
    }
    fetchData()
  }, [isAuthLoading, userRoles])

  if (isAuthLoading) return <div style={{ padding: '20px' }}>読み込み中...</div>
  if (!canManageAnnouncements(userRoles)) return <div style={{ padding: '20px' }}>権限がありません</div>

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>お知らせ管理</h2>
        <Link href="/announcements/new" style={{ backgroundColor: '#0070f3', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>新規作成</Link>
      </div>
      {announcements.map(ann => (
        <div key={ann.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{ann.publish_date} | 既読: <Link href={`/announcements/admin/${ann.id}`}>👀 {readCounts[ann.id] || 0}</Link></div>
            <div style={{ fontWeight: 'bold' }}>{ann.is_pinned && '📌 '}{ann.title}</div>
          </div>
          <Link href={`/announcements/edit/${ann.id}`} style={{ color: '#0070f3' }}>編集</Link>
        </div>
      ))}
    </div>
  )
}