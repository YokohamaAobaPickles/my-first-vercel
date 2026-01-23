/**
 * Filename: announcements/[id]/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-23 
 * 修正内容：
 * V1.3.0
 * - hookAuthCheck対応
 * V1.2.1
 * - 既読記録の修正。デバッグ用コンソール文追加
 * V1.2.0
 * - 既読記録の追加
 * V1.1.0
 * - 管理者権限がある場合のみ、右上に「編集」ボタンを表示
 * V1.0.0
 * - お知らせ詳細表示用（B-02）
 * - ページ閲覧時の自動既読記録機能（B-03）
 * - LIFF連携による閲覧ユーザー特定
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
  const { isLoading: isAuthLoading, userRoles, currentLineId } = useAuthCheck()
  const [announcement, setAnnouncement] = useState<any>(null)

  useEffect(() => {
    if (isAuthLoading || !currentLineId || !id) return

    const fetchAndRecord = async () => {
      // 1. 詳細取得
      const { data } = await supabase.from('announcements').select('*').eq('id', id).single()
      if (data) setAnnouncement(data)

      // 2. 既読記録 (upsertで重複防止)
      await supabase.from('announcement_reads').upsert({
        announcement_id: Number(id),
        user_id: currentLineId,
        read_at: new Date().toISOString()
      }, { onConflict: 'announcement_id, user_id' })
    }

    fetchAndRecord()
  }, [isAuthLoading, currentLineId, id])

  if (isAuthLoading || !announcement) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{announcement.publish_date}</div>
        {canManageAnnouncements(userRoles) && (
          <Link href={`/announcements/edit/${announcement.id}`} style={{
            backgroundColor: '#f0f0f0', padding: '6px 14px', borderRadius: '15px', fontSize: '0.8rem', border: '1px solid #ccc', textDecoration: 'none'
          }}>編集</Link>
        )}
      </div>
      <h1 style={{ fontSize: '1.4rem', lineHeight: '1.4' }}>
        {announcement.is_pinned && '📌 '}{announcement.title}
      </h1>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
        {announcement.content}
      </div>
      <Link href="/announcements" style={{ display: 'block', marginTop: '40px' }}>一覧に戻る</Link>
    </div>
  )
}