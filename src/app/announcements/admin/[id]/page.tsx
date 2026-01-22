/**
 * Filename: announcements/admin/[id]/page.tsx
 * Version : V1.0.0
 * Update  : 2026-01-22
 * 内容：特定のお知らせの既読ユーザー一覧を表示（管理者用）
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

type ReadUser = {
  user_id: string
  read_at: string
  members: {
    name: string
  } | null
}

export default function AnnouncementReadDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [readers, setReaders] = useState<ReadUser[]>([])
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReadData = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (!liff.isLoggedIn()) return liff.login()

        const profile = await liff.getProfile()
        const { data: member } = await supabase.from('members').select('roles').eq('line_id', profile.userId).single()

        if (!canManageAnnouncements(member?.roles || null)) {
          router.push('/announcements')
          return
        }

        // 1. 記事タイトルの取得
        const { data: ann } = await supabase.from('announcements').select('title').eq('id', id).single()
        if (ann) setAnnouncementTitle(ann.title)

        // 2. 既読ユーザーと名前を結合して取得
        const { data: readData, error } = await supabase
          .from('announcement_reads')
          .select(`
            user_id,
            read_at,
            members (
              name
            )
          `)
          .eq('announcement_id', id)
          .order('read_at', { ascending: false })

        if (!error) setReaders(readData as any)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReadData()
  }, [id])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.1rem', color: '#666', marginBottom: '5px' }}>既読ユーザー一覧</h1>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>{announcementTitle}</h2>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>氏名</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem' }}>既読日時</th>
            </tr>
          </thead>
          <tbody>
            {readers.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>既読ユーザーはいません</td>
              </tr>
            ) : (
              readers.map((r, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontSize: '1rem' }}>{r.members?.name || '不明なユーザー'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>
                    {new Date(r.read_at).toLocaleString('ja-JP')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/announcements/admin" style={{ 
          display: 'inline-block', 
          padding: '10px 20px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px', 
          textDecoration: 'none', 
          color: '#333' 
        }}>
          ← 管理一覧へ戻る
        </Link>
      </div>
    </div>
  )
}