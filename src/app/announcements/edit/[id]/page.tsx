/**
 * Filename: announcements/edit/[id]/page.tsx
 * Version : V1.1.0
 * Update  : 2026-01-21
 * V1.1.0
 * - 物理削除機能の追加
 */

'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'
import { canManageAnnouncements } from '@/utils/auth'

export default function EditAnnouncementPage() {
  const router = useRouter()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  // フォームの状態
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [targetRole, setTargetRole] = useState('ALL')
  const [status, setStatus] = useState('published')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. LIFF初期化と権限チェック
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
          alert('アクセス権限がありません。')
          router.push('/announcements')
          return
        }
        setHasPermission(true)

        // 2. 既存データの取得
        const { data: ann, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !ann) {
          alert('記事の取得に失敗しました。')
          router.push('/announcements')
          return
        }

        // フォームに値をセット
        setTitle(ann.title)
        setContent(ann.content || '')
        setPublishDate(ann.publish_date || '')
        setIsPinned(ann.is_pinned)
        setTargetRole(ann.target_role || 'ALL')
        setStatus(ann.status || 'published')

      } catch (err) {
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, router])

  // 物理削除
  const handleDelete = async () => {
    // 誤操作防止の確認ダイアログ
    const confirmed = window.confirm(
      "この記事を完全に削除しますか？\nこの操作は取り消せません。"
    );
    if (!confirmed) return;

    setSaving(true); // 保存中と同じローディング状態を利用
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert('削除に失敗しました: ' + error.message);
      setSaving(false);
    } else {
      alert('お知らせを完全に削除しました。');
      router.push('/announcements/admin'); // 削除後は管理画面へ
    }
  };

  // 記事更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) {
      alert('タイトルと本文を入力してください。')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('announcements')
      .update({
        title,
        content,
        publish_date: publishDate,
        is_pinned: isPinned,
        target_role: targetRole,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      alert('更新に失敗しました: ' + error.message)
    } else {
      alert('お知らせを更新しました。')
      router.push(`/announcements/${id}`) // 詳細画面に戻る
    }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: '20px' }}>データを読み込み中...</div>
  if (!hasPermission) return null

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>
        お知らせの編集
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: 'black', color: 'white' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', lineHeight: '1.5', backgroundColor: 'black', color: 'white' }}
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
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'black', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>ステータス</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'black', color: 'white' }}
            >
              <option value="published">公開</option>
              <option value="draft">下書き（非公開）</option>
              <option value="disable">無効（非公開）</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>表示対象</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'black', color: 'white' }}
          >
            <option value="ALL">全員</option>
            <option value="PREMIUM">プレミア会員</option>
          </select>
        </div>

        <div style={{
          marginBottom: '25px',
          padding: '10px',
          backgroundColor: '#333',
          color: '#fff',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '16px',
              backgroundColor: saving ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? '処理中...' : '変更保存'}
          </button>

          <button
            type="button" // type="submit" にしないよう注意
            onClick={handleDelete}
            disabled={saving}
            style={{
              padding: '16px',
              backgroundColor: 'transparent',
              color: '#ff4d4f',
              border: '2px solid #ff4d4f',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            物理削除
          </button>
        </div>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', fontSize: '0.9rem' }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}