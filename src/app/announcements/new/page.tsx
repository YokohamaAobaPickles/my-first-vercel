/**
 * Filename: announcements/new/page.tsx
 * Version : V1.1.0
 * Update  : 2026-01-21
 * 修正内容：
 * - DBカラム名に合わせて target_role に修正
 * - author_id (LINE ID) を保存するように追加
 */

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [lineId, setLineId] = useState<string | null>(null)

  // フォームの状態
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0])
  const [isPinned, setIsPinned] = useState(false)
  const [targetRole, setTargetRole] = useState('ALL') // 全員(ALL) または特定のロール

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        const profile = await liff.getProfile()
        setLineId(profile.userId) // 作成者IDとして保持

        const { data: member } = await supabase
          .from('members')
          .select('roles')
          .eq('line_id', profile.userId)
          .single()

        if (canManageAnnouncements(member?.roles || null)) {
          setHasPermission(true)
        } else {
          alert('アクセス権限がありません。')
          router.push('/announcements')
        }
      } catch (err) {
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      alert('タイトルと本文を入力してください。')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('announcements').insert([
      {
        title,
        content,
        publish_date: publishDate,
        is_pinned: isPinned,
        target_role: targetRole, // カラム名を修正
        status: 'published',
        author_id: lineId, // 作成者のLINE IDを記録
      },
    ])

    if (error) {
      alert('保存に失敗しました: ' + error.message)
    } else {
      alert('お知らせを公開しました。')
      router.push('/announcements')
    }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: '20px' }}>権限を確認中...</div>
  if (!hasPermission) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>
        お知らせ新規作成
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            placeholder="例：次回会合のお知らせ"
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', lineHeight: '1.5' }}
            placeholder="お知らせの内容を入力してください"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>公開日</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>表示対象</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }}
            >
              <option value="ALL">全員</option>
              <option value="PREMIUM">プレミア会員</option>
            </select>
          </div>
        </div>

        <div style={{ 
          marginBottom: '25px', 
          padding: '10px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="checkbox"
            id="pinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            style={{ width: '18px', height: '18px', marginRight: '10px' }}
          />
          <label htmlFor="pinned" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            重要記事として一覧の上部に固定する
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: saving ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {saving ? '保存中...' : 'お知らせを公開する'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          キャンセルして戻る
        </button>
      </div>
    </div>
  )
}