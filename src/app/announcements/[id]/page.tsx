/**
 * Filename: announcements/[id]/page.tsx
 * Version : V1.1.0
 * Update  : 2026-01-21 
 * 修正内容：
 * V1.1.0
 * - 管理者権限がある場合のみ、右上に「編集」ボタンを表示
 * V1.0.0
 * - お知らせ詳細表示用（B-02）
 * - ページ閲覧時の自動既読記録機能（B-03）
 * - LIFF連携による閲覧ユーザー特定
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

type Announcement = {
  id: number
  title: string
  content: string
  publish_date: string
  is_pinned: boolean
  target_role: string
}

export default function AnnouncementDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // 1. LIFF初期化とロール取得
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile()
          const { data: member } = await supabase
            .from('members')
            .select('roles')
            .eq('line_id', profile.userId)
            .single()
          setUserRoles(member?.roles || null)
        }

        // 2. お知らせ詳細取得
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setAnnouncement(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>
  if (!announcement) return <div style={{ padding: '20px' }}>記事が見つかりません。</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>{announcement.publish_date}</div>
        
        {/* 管理者の場合のみ「編集」ボタンを表示 */}
        {canManageAnnouncements(userRoles) && (
          <Link href={`/announcements/edit/${announcement.id}`} style={{
            backgroundColor: '#f0f0f0',
            color: '#333',
            padding: '6px 14px',
            borderRadius: '15px',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            border: '1px solid #ccc'
          }}>
            編集
          </Link>
        )}
      </div>

      <h1 style={{ fontSize: '1.4rem', marginBottom: '20px', lineHeight: '1.4' }}>
        {announcement.is_pinned && <span style={{ color: '#ff4d4f', marginRight: '8px' }}>📌</span>}
        {announcement.title}
      </h1>

      <div style={{ 
        whiteSpace: 'pre-wrap', 
        lineHeight: '1.8', 
        fontSize: '1rem',
        borderTop: '1px solid #eee',
        paddingTop: '20px'
      }}>
        {announcement.content}
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer', fontSize: '1rem' }}>
          ← 戻る
        </button>
      </div>
    </div>
  )
}