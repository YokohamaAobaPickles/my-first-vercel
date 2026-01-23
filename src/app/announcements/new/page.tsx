/**
 * Filename: announcements/new/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-23
 * 内容：
 * V1.2.0
 * - hook/authCheckに対応
 * V1.1.0
 * - DBカラム名に合わせて target_role に修正
 * - author_id (LINE ID) を保存するように追加
 */

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const { isLoading: isAuthLoading, userRoles, currentLineId } = useAuthCheck()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0], isPinned: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('announcements').insert({
      title: form.title, content: form.content, publish_date: form.date, is_pinned: form.isPinned, author_id: currentLineId, status: 'published'
    })
    if (!error) router.push('/announcements/admin')
    setSaving(false)
  }

  if (isAuthLoading) return <div style={{ padding: '20px' }}>読み込み中...</div>
  if (!canManageAnnouncements(userRoles)) return <div>権限がありません</div>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>新規お知らせ作成</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="タイトル" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px' }} />
        <textarea placeholder="本文" required value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ width: '100%', height: '200px', padding: '12px', marginBottom: '15px' }} />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px' }} />
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <input type="checkbox" checked={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.checked})} /> 重要記事として固定
        </label>
        <button type="submit" disabled={saving} style={{ width: '100%', padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px' }}>
          {saving ? '保存中...' : '公開する'}
        </button>
      </form>
    </div>
  )
}