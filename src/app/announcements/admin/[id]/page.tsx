/**
 * Filename: announcements/admin/[id]/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-22
 * 内容：
 * V1.3.0
 * - @/hooks/useAuthCheckに対応
 * V1.2.0
 * - ニックネーム(本名)表示に変更
 * V1.1.0
 * - テーブル内カラム修正 user_id → line_id
 * - デザインをダークモード（黒背景・白文字）に変更
 * - 戻るボタンをシンプルなテキストリンクに変更
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementReadDetailPage() {
  const { id } = useParams()
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck()
  const [readers, setReaders] = useState<any[]>([])

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return

    const fetchReaders = async () => {
      const { data } = await supabase
        .from('announcement_reads')
        .select('read_at, members(name, nickname)')
        .eq('announcement_id', id)
        .order('read_at', { ascending: false })
      setReaders(data || [])
    }
    fetchReaders()
  }, [isAuthLoading, userRoles, id])

  if (isAuthLoading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h3>既読ユーザー一覧</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead><tr style={{ borderBottom: '2px solid #eee' }}><th style={{ textAlign: 'left', padding: '10px' }}>氏名</th><th style={{ textAlign: 'right', padding: '10px' }}>日時</th></tr></thead>
        <tbody>
          {readers.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{r.members?.nickname} ({r.members?.name})</td>
              <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>{new Date(r.read_at).toLocaleString('ja-JP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/announcements/admin" style={{ display: 'block', marginTop: '30px' }}>管理一覧に戻る</Link>
    </div>
  )
}