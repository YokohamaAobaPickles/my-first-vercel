/**
 * Filename: announcements/admin/[id]/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-22
 * 修正内容：
 * V1.2.0
 * - ニックネーム(本名)表示に変更
 * V1.1.0
 * - テーブル内カラム修正 user_id → line_id
 * - デザインをダークモード（黒背景・白文字）に変更
 * - 戻るボタンをシンプルなテキストリンクに変更
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

type ReadUser = {
  line_id: string
  read_at: string
  members: {
    name: string
    nickname: string
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

        const { data: ann } = await supabase.from('announcements').select('title').eq('id', id).single()
        if (ann) setAnnouncementTitle(ann.title)

        // カラム名を line_id に修正して取得
        const { data: readData, error } = await supabase
          .from('announcement_reads')
          .select(`
            line_id,
            read_at,
            members (
              name,
              nickname
            )
          `)
          .eq('announcement_id', id)
          .order('read_at', { ascending: false });

        if (!error) setReaders(readData as any)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReadData()
  }, [id])

  if (loading) return <div style={{ padding: '20px', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>読み込み中...</div>

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#121212', // 深い黒
      color: '#ffffff',           // 白文字
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>既読ユーザー一覧</h1>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        {announcementTitle}
      </h2>

      <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem', color: '#aaa' }}>氏名</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem', color: '#aaa' }}>既読日時</th>
            </tr>
          </thead>
          <tbody>
            {readers.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>既読ユーザーはいません</td>
              </tr>
            ) : (
              readers.map((r, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px', fontSize: '1rem' }}>{r.members
                    ? `${r.members.nickname} (${r.members.name})`
                    : '不明なユーザー'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.8rem', color: '#aaa' }}>
                    {new Date(r.read_at).toLocaleString('ja-JP')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link href="/announcements/admin" style={{
          textDecoration: 'none',
          color: '#0070f3', // リンクらしい青色
          fontSize: '1rem'
        }}>
          ← 管理一覧へ戻る
        </Link>
      </div>
    </div>
  )
}