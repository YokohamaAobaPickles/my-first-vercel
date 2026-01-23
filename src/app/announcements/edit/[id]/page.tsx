/**
 * Filename: announcements/edit/[id]/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-21
 * 内容：
 * V1.2.0
 * - hook/authCheckに対応
 * V1.1.0
 * - 物理削除機能の追加
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function EditAnnouncementPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck()
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return
    supabase.from('announcements').select('*').eq('id', id).single().then(({ data }) => setForm(data))
  }, [isAuthLoading, userRoles, id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('announcements').update({
      title: form.title, content: form.content, publish_date: form.publish_date, is_pinned: form.is_pinned
    }).eq('id', id)
    router.push('/announcements/admin')
  }

  const handleDelete = async () => {
    if (confirm('本当に削除しますか？')) {
      await supabase.from('announcements').delete().eq('id', id)
      router.push('/announcements/admin')
    }
  }

  if (isAuthLoading || !form) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>お知らせ編集</h2>
      <form onSubmit={handleUpdate}>
        <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px' }} />
        <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ width: '100%', height: '200px', padding: '12px', marginBottom: '15px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px' }}>保存</button>
          <button type="button" onClick={handleDelete} style={{ padding: '15px', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '8px' }}>削除</button>
        </div>
      </form>
    </div>
  )
}