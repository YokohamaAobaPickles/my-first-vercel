/**
 * Filename: announcements/edit/[id]/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-25
 * 内容：
 * V1.3.0
 * - レイアウト修正(800px、中央寄せ)
 * - ダークモード対応スタイルへの完全移行
 * - ステータス変更、物理削除ボタンの視認性向上
 * V1.2.0
 * - hook/authCheckに対応
 * V1.1.0
 * - 物理削除機能の追加
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function EditAnnouncementPage() {
  const { id } = useParams()
  const router = useRouter()
  const { 
    isLoading: isAuthLoading, 
    userRoles 
  } = useAuthCheck()
  
  const [form, setForm] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return
    
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()
      if (data) setForm(data)
    }
    fetchArticle()
  }, [isAuthLoading, userRoles, id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('announcements')
      .update({
        title: form.title, 
        content: form.content, 
        publish_date: form.publish_date, 
        is_pinned: form.is_pinned,
        status: form.status
      })
      .eq('id', id)
    
    if (!error) {
      router.push('/announcements/admin')
    } else {
      alert(error.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (confirm('この記事を完全に削除しますか？（復元できません）')) {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)
      if (!error) router.push('/announcements/admin')
    }
  }

  if (isAuthLoading || !form) {
    return <div style={containerStyle}>読み込み中...</div>
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/announcements/admin" style={cancelLinkStyle}>
          ← 編集をキャンセル
        </Link>
      </div>

      <h2 style={formTitleStyle}>お知らせの編集</h2>

      <form onSubmit={handleUpdate} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>タイトル</label>
          <input 
            type="text" 
            required 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            style={inputStyle} 
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>本文</label>
          <textarea 
            required 
            value={form.content} 
            onChange={e => setForm({...form, content: e.target.value})} 
            style={{ ...inputStyle, height: '250px', resize: 'vertical' }} 
          />
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>公開開始日</label>
            <input 
              type="date" 
              value={form.publish_date} 
              onChange={e => setForm({...form, publish_date: e.target.value})} 
              style={inputStyle} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>公開ステータス</label>
            <select 
              value={form.status} 
              onChange={e => setForm({...form, status: e.target.value})} 
              style={inputStyle}
            >
              <option value="published">公開</option>
              <option value="draft">下書き</option>
              <option value="disabled">無効</option>
            </select>
          </div>
        </div>

        <div style={checkboxWrapperStyle}>
          <label style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              checked={form.is_pinned} 
              onChange={e => setForm({...form, is_pinned: e.target.checked})} 
            />
            <span>重要記事としてトップに固定する</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button disabled={saving} style={submitBtnStyle}>
            {saving ? '更新中...' : '変更を保存する'}
          </button>
          <button 
            type="button" 
            onClick={handleDelete} 
            style={deleteBtnStyle}
          >
            削除
          </button>
        </div>
      </form>
    </div>
  )
}

// スタイル定義
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto'
}

const cancelLinkStyle: React.CSSProperties = {
  color: '#888',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const formTitleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  marginBottom: '25px',
  textAlign: 'center'
}

const formStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #222'
}

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: '20px'
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#aaa',
  marginBottom: '8px',
  fontWeight: 'bold'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#222',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '1rem',
  boxSizing: 'border-box'
}

const checkboxWrapperStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '10px',
  border: '1px solid #333'
}

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  fontSize: '0.9rem'
}

const submitBtnStyle: React.CSSProperties = {
  flex: 3,
  padding: '16px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem'
}

const deleteBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px',
  backgroundColor: '#333',
  color: '#ff4d4f',
  border: '1px solid #444',
  borderRadius: '30px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem'
}