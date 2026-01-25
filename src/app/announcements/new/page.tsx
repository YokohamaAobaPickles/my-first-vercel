/**
 * Filename: announcements/new/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-25
 * 内容：
 * V1.3.0
 * - レイアウト修正(800px、中央寄せ)
 * - ダークモードでの入力欄視認性向上
 * - 公開日・ステータス設定のスタイル崩れを修正
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
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const { 
    isLoading: isAuthLoading, 
    userRoles, 
    currentLineId, 
    user 
  } = useAuthCheck()
  
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    date: new Date().toISOString().split('T')[0], 
    isPinned: false,
    status: 'published'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('announcements').insert({
      title: form.title, 
      content: form.content, 
      publish_date: form.date, 
      is_pinned: form.isPinned, 
      author_id: currentLineId || user?.email,
      status: form.status
    })
    
    if (!error) {
      router.push('/announcements/admin')
    } else {
      alert(error.message)
    }
    setSaving(false)
  }

  if (isAuthLoading) return <div style={containerStyle}>読み込み中...</div>
  if (!canManageAnnouncements(userRoles)) {
    return <div style={containerStyle}>権限がありません</div>
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/announcements/admin" style={cancelLinkStyle}>
          ← キャンセルして戻る
        </Link>
      </div>

      <h2 style={formTitleStyle}>新規お知らせ投稿</h2>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>タイトル *</label>
          <input 
            type="text" 
            required 
            placeholder="記事のタイトルを入力" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            style={inputStyle} 
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>本文 *</label>
          <textarea 
            required 
            placeholder="本文を入力してください" 
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
              value={form.date} 
              onChange={e => setForm({...form, date: e.target.value})} 
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
              <option value="disabled">無効化</option>
            </select>
          </div>
        </div>

        <div style={checkboxWrapperStyle}>
          <label style={checkboxLabelStyle}>
            <input 
              type="checkbox" 
              checked={form.isPinned} 
              onChange={e => setForm({...form, isPinned: e.target.checked})} 
              style={{ width: '18px', height: '18px' }}
            />
            <span>重要記事として一覧の最上部に固定する</span>
          </label>
        </div>

        <button disabled={saving} style={submitBtnStyle}>
          {saving ? '保存処理中...' : 'この記事を登録する'}
        </button>
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
  marginBottom: '25px',
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
  width: '100%',
  padding: '16px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.2s'
}