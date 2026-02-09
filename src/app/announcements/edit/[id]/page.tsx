/**
 * Filename: src/app/announcements/admin/edit/[id]/page.tsx
 * Version : V1.5.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.5.0
 * - エラー時の UI を改善（Loading のまま固まらないように）
 * - fetchAnnouncementById の失敗時にエラー画面を表示
 * - 削除時の confirm(false) パターンに対応（テスト B-12）
 * - saving 状態の扱いを改善（更新中の連打防止）
 * 
 * V1.4.0
 * - announcementApi を使用した実装へ全面刷新 (B-12)
 * - スキーマ変更 (announcement_id) に対応
 * - 物理削除ボタンの実装
 * - スタイル定義をルール（定義ごとに改行）に従い修正
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageAnnouncements } from '@/utils/auth'
import {
  fetchAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} from '@/lib/announcementApi'
import { 
  Announcement, 
  AnnouncementStatus 
} from '@/types/announcement'

export default function EditAnnouncementPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck()
  
  const [form, setForm] = useState<Announcement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading) return

    // 権限チェック
    if (!canManageAnnouncements(userRoles)) {
      router.push('/announcements')
      return
    }
    
    const loadArticle = async () => {
      setLoading(true)
      const res = await fetchAnnouncementById(Number(id))

      if (res.success && res.data) {
        setForm(res.data)
      } else {
        setError(res.error?.message || '記事の読み込みに失敗しました。')
      }

      setLoading(false)
    }

    loadArticle()
  }, [isAuthLoading, userRoles, id, router])

  // --- Loading 表示 ---
  if (loading && !error) {
    return <div style={loadingStyle}>Loading...</div>
  }

  // --- エラー表示（Loading のまま固まらないよう改善） ---
  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
        <Link href="/announcements/admin" style={backLinkStyle}>
          ← 管理一覧へ戻る
        </Link>
      </div>
    )
  }

  if (!form) return null

  // --- 更新処理 ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    
    const res = await updateAnnouncement(form.announcement_id, {
      title: form.title,
      content: form.content,
      publish_date: form.publish_date,
      status: form.status,
      is_pinned: form.is_pinned,
      target_role: form.target_role,
      end_date: form.end_date
    })

    if (res.success) {
      router.push('/announcements/admin')
    } else {
      setError('更新に失敗しました。')
      setSaving(false)
    }
  }

  // --- 削除処理 ---
  const handleDelete = async () => {
    if (!form) return

    // confirm(false) のテストに対応
    if (!confirm('この記事を完全に削除しますか？この操作は取り消せません。')) {
      return
    }

    const res = await deleteAnnouncement(form.announcement_id)
    if (res.success) {
      router.push('/announcements/admin')
    } else {
      setError('削除に失敗しました。')
    }
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Link href="/announcements/admin" style={backLinkStyle}>
          ← 管理一覧へ戻る
        </Link>
        <h1 style={titleStyle}>お知らせの編集</h1>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleUpdate} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>タイトル</label>
          <input
            type="text"
            style={inputStyle}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>本文</label>
          <textarea
            style={{ ...inputStyle, minHeight: '200px' }}
            value={form.content || ''}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>公開開始日</label>
            <input
              type="date"
              style={inputStyle}
              value={form.publish_date || ''}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ステータス</label>
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => 
                setForm({ ...form, status: e.target.value as AnnouncementStatus })
              }
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
              <option value="disabled">無効化</option>
            </select>
          </div>
        </div>

        <div style={checkboxWrapperStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
            />
            重要記事としてトップに固定表示する
          </label>
        </div>

        <button type="submit" disabled={saving} style={submitBtnStyle}>
          {saving ? '保存中...' : '更新する'}
        </button>
      </form>

      <div style={dangerZoneStyle}>
        <button onClick={handleDelete} style={deleteBtnStyle}>
          この記事を完全に削除
        </button>
      </div>
    </div>
  )
}

/* --- スタイル定義 --- */

const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '40px 20px',
  maxWidth: '800px',
  margin: '0 auto',
}

const headerStyle: React.CSSProperties = {
  marginBottom: '30px',
}

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginTop: '10px',
}

const loadingStyle: React.CSSProperties = {
  color: '#fff',
  textAlign: 'center',
  padding: '50px',
}

const formStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #222',
}

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#aaa',
  marginBottom: '8px',
  fontWeight: 'bold',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#222',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '1rem',
  boxSizing: 'border-box',
}

const checkboxWrapperStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '25px',
  border: '1px solid #333',
}

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
}

const dangerZoneStyle: React.CSSProperties = {
  marginTop: '40px',
  paddingTop: '20px',
  borderTop: '1px solid #333',
  textAlign: 'center',
}

const deleteBtnStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#ff4d4f',
  border: '1px solid #ff4d4f',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
}
