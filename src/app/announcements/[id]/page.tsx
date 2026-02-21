/**
 * Filename: src/app/announcements/[id]/page.tsx
 * Version : V1.6.0
 * Update  : 2026-02-08
 * Remarks :
 * V1.6.0
 * - デザインを新スタイルに変更 
 * V1.5.0
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
import { baseStyles } from '@/types/styles/style_common'
import { annStyles } from '@/types/styles/style_announcements'

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
      // ログイン前のアクセスをガード
      if (!isAuthLoading && !user) {
        router.replace('/login')
        return
      }

      if (isAuthLoading || !user?.id || !params.id) return

      setIsDataLoading(true)
      const announcementId = Number(params.id)
      // 記事詳細の取得
      const result = await fetchAnnouncementById(announcementId)

      if (!isMounted) return

      if (result.success && result.data) {
        setAnnouncement(result.data)
        // 既読を記録
        await recordRead(announcementId, user.id)
      } else {
        setError('お知らせが見つかりません。')
      }

      setIsDataLoading(false)
    }

    loadData()
    return () => { isMounted = false }
  }, [params.id, isAuthLoading, user?.id, user, router])

  if (isAuthLoading || isDataLoading || !user) {
    return <div style={baseStyles.containerDefault}>読み込み中...</div>
  }

  if (error || !announcement) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>{error || 'お知らせが見つかりません。'}</p>
          <button
            onClick={() => router.back()}
            style={baseStyles.primaryButton}
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>

        {/* --- ヘッダーエリア --- */}
        <div style={annStyles.detailHeader}>
          <button
            onClick={() => router.back()}
            style={annStyles.backButtonMinimal}
          >
            ＜ 戻る
          </button>
        </div>

        {/* --- 記事カード --- */}
        <article style={annStyles.detailContentCard}>
          <div style={annStyles.publishDate}>
            {announcement.publish_date}
          </div>

          <h1 style={annStyles.detailTitle}>
            {announcement.title}
          </h1>

          <hr style={annStyles.separator} />

          <div style={annStyles.bodyText}>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {announcement.content}
            </p>
          </div>
        </article>

      </div>
    </div>
  )
}
