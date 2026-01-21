/**
 * Filename: announcements/[id]/page.tsx
 * Version : V1.0.0
 * Update  : 2026-01-21 
 * 修正内容：
 * V1.0.0
 * - お知らせ詳細表示用（B-02）
 * - ページ閲覧時の自動既読記録機能（B-03）
 * - LIFF連携による閲覧ユーザー特定
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import liff from '@line/liff'
import Link from 'next/link'

type Announcement = {
  id: number
  title: string
  content: string
  publish_date: string
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initPage = async () => {
      const { id } = params
      if (!id) return

      // 1. お知らせ詳細の取得
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching detail:', error)
      } else {
        setAnnouncement(data)
        
        // 2. 既読の記録（LIFFと連携）
        try {
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile()
            
            // 既読テーブルにインサート（重複はDB側で無視、またはそのまま追加）
            await supabase.from('announcement_reads').insert([
              { 
                announcement_id: id, 
                user_id: profile.userId 
              }
            ])
            console.log('既読を記録しました')
          }
        } catch (liffError) {
          console.error('LIFF既読記録エラー:', liffError)
        }
      }
      setLoading(false)
    }

    initPage()
  }, [params])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>
  if (!announcement) return <div style={{ padding: '20px' }}>記事が見つかりません。</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/announcements" style={{ fontSize: '0.9rem' }}>← 一覧へ戻る</Link>
      
      <h1 style={{ fontSize: '1.5rem', marginTop: '20px' }}>{announcement.title}</h1>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>公開日: {announcement.publish_date}</p>
      
      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
      
      <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
        {announcement.content}
      </div>
    </div>
  )
}