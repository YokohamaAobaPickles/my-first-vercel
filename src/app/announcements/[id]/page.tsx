/**
 * Filename: src/app/announcements/[id]/page.tsx
 * Version : V1.5.0
 * Update  : 2026-02-08
 * Remarks : 
 * - お知らせ詳細参照 (B-02) および既読管理 (B-03) の実装
 * - isMounted ガードによるレースコンディションの完全防止
 * - スタイル定義をルール（定義ごとに改行）に従い刷新
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchAnnouncementById, recordRead } from '@/lib/announcementApi'
import { Announcement } from '@/types/announcement'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isLoading: isAuthLoading, user } = useAuthCheck()

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      // 認証状況、ユーザーID、URLパラメータの存在を確認
      if (isAuthLoading || !user?.id || !params.id) return

      setIsDataLoading(true)
      const announcementId = Number(params.id)

      // 1. 記事詳細の取得
      const result = await fetchAnnouncementById(announcementId)

      // アンマウント後の状態更新を防止
      if (!isMounted) return

      if (result.success && result.data) {
        setAnnouncement(result.data)
        
        // 2. 既読の記録 (会員ID user.id を使用)
        // 確実に記録を完了させてから次の処理へ（または順序を意識）
        await recordRead(announcementId, user.id)
      } else {
        setError('お知らせが見つかりません。')
      }
      setIsDataLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [params.id, isAuthLoading, user?.id])

  if (isAuthLoading || isDataLoading) {
    return <div style={containerStyle}>読み込み中...</div>
  }

  if (error || !announcement) {
    return (
      <div style={containerStyle}>
        <div style={errorWrapperStyle}>
          <p>{error || 'お知らせが見つかりません。'}</p>
          <button onClick={() => router.back()} style={backBtnStyle}>
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <button onClick={() => router.back()} style={textBackBtnStyle}>
        ← 一覧に戻る
      </button>

      <article style={contentCardStyle}>
        <div style={dateStyle}>{announcement.publish_date}</div>
        <h1 style={titleStyle}>{announcement.title}</h1>
        <hr style={hrStyle} />
        <div style={bodyStyle}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
        </div>
      </article>
    </div>
  )
}

// --- スタイル定義 (1行80カラム、定義ごとに改行) ---

const containerStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#f9fafb',
  minHeight: '100vh',
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
}

const errorWrapperStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '40px',
}

const contentCardStyle: React.CSSProperties = {
  backgroundColor: '#1f2937',
  padding: '32px',
  borderRadius: '8px',
  marginTop: '16px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  marginBottom: '12px',
  lineHeight: '1.4',
}

const dateStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '0.875rem',
  marginBottom: '20px',
}

const hrStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #374151',
  marginBottom: '24px',
}

const bodyStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  lineHeight: '1.8',
  color: '#e5e7eb',
}

const backBtnStyle: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  padding: '8px 24px',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '16px',
}

const textBackBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: '0.875rem',
  padding: 0,
  marginBottom: '16px',
}