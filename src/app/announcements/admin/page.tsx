/**
 * Filename: announcements/admin/page.tsx
 * Version : V1.0.0
 * Update  : 2026-01-22
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

type Announcement = {
  id: number
  title: string
  publish_date: string
  status: string
  is_pinned: boolean
}

export default function AnnouncementAdminPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        
        const profile = await liff.getProfile()
        const { data: member } = await supabase
          .from('members')
          .select('roles')
          .eq('line_id', profile.userId)
          .single()

        if (!canManageAnnouncements(member?.roles || null)) {
          alert('権限がありません')
          router.push('/announcements')
          return
        }
        setHasPermission(true)

        // 管理者なので、フィルタなしで全件取得（新しい順）
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, publish_date, status, is_pinned')
          .order('publish_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        setAnnouncements(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    checkAuthAndFetch()
  }, [router])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>
  if (!hasPermission) return null

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>お知らせ管理</h1>
        <Link href="/announcements/new" style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          ＋ 新規作成
        </Link>
      </div>

      <div style={{ borderTop: '1px solid #eee' }}>
        {announcements.map((ann) => (
          <div key={ann.id} style={{ 
            padding: '15px 0', 
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  backgroundColor: ann.status === 'published' ? '#e6f7ff' : '#fff1f0',
                  color: ann.status === 'published' ? '#1890ff' : '#f5222d',
                  border: `1px solid ${ann.status === 'published' ? '#91d5ff' : '#ffa39e'}`
                }}>
                  {ann.status === 'published' ? '公開' : '下書き'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{ann.publish_date}</span>
              </div>
              <Link href={`/announcements/${ann.id}`} style={{ 
                textDecoration: 'none', 
                color: '#333',
                fontWeight: ann.is_pinned ? 'bold' : 'normal'
              }}>
                {ann.is_pinned && '📌 '}{ann.title}
              </Link>
            </div>
            <Link href={`/announcements/edit/${ann.id}`} style={{ 
              fontSize: '0.9rem', 
              color: '#0070f3',
              textDecoration: 'none',
              marginLeft: '15px'
            }}>
              編集
            </Link>
          </div>
        ))}
        {announcements.length === 0 && <div style={{ padding: '20px', textAlign: 'center' }}>記事がありません</div>}
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/announcements" style={{ color: '#666', fontSize: '0.9rem' }}>
          ← 一般公開一覧へ
        </Link>
      </div>
    </div>
  )
}