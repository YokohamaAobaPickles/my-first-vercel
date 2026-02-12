/**
 * Filename: src/app/announcements/page.tsx
 * Version : V1.6.0
 * Update  : 2026-02-11
 * Remarks : 
 * V1.6.0 - ボトムナビ導入に伴い「戻る」リンクを削除。管理ボタンをタイトル右へ移動。
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { fetchAnnouncements } from '@/lib/announcementApi'
import { AnnouncementListItem } from '@/types/announcement'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { baseStyles } from '@/types/styles/style_common'
import { annStyles } from '@/types/styles/style_announcements'

export default function AnnouncementsPage() {
  const router = useRouter()
  const { isLoading: isAuthLoading, userRoles, user } = useAuthCheck()

  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      // 1. 認証チェックが終わり、ユーザーがいない場合はログイン画面へ
      if (!isAuthLoading && !user) {
        router.replace('/members/login')
        return
      }

      // 2. 認証チェック中、またはユーザーIDがまだ確定していない場合はデータ取得を待つ
      if (isAuthLoading || !user?.id) return

      setIsDataLoading(true)
      const result = await fetchAnnouncements(user.id)

      if (isMounted) {
        setAnnouncements(result.data ?? [])
        setIsDataLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [isAuthLoading, user?.id, user, router]) // 依存配列に user と router を追加

  if (isAuthLoading || isDataLoading || !user) {
    return <div style={baseStyles.containerDefault}>読み込み中...</div>
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>

        {/* --- タイトル ＆ 管理ボタン --- */}
        <div style={baseStyles.listHeader}>
          <h1 style={{ ...baseStyles.headerTitle, marginBottom: 0 }}>
            お知らせ
          </h1>
          {canManageAnnouncements(userRoles) && (
            <Link href="/announcements/admin" style={baseStyles.adminButtonSmall}>
              管理パネル
            </Link>
          )}
        </div>

        {/* --- お知らせがない場合 --- */}
        {announcements.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '40px', color: '#9CA3AF' }}>
            現在お知らせはありません。
          </p>
        ) : (

          <div style={annStyles.listContainerCard}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {announcements.map((item) => (
                <li key={item.announcement_id} style={annStyles.listItemWrapper}>
                  <div style={annStyles.listPublishDate}>
                    {item.publish_date} {item.is_read && '(既読)'}
                  </div>

                  <div style={annStyles.listTitleRow}>
                    {item.is_pinned && (
                      <span style={annStyles.listImportanceLabel}>重要</span>
                    )}
                    <Link
                      href={`/announcements/${item.announcement_id}`}
                      style={{
                        ...annStyles.listTitleLink,
                        color: item.is_read ? '#9CA3AF' : '#08A5EF',
                        fontWeight: item.is_read ? '400' : '700',
                      }}
                    >
                      {item.title}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}