'use client'

/**
 * Filename: src/app/facilities/groups/page.tsx
 * Version: V1.3.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.3.0 - 新規追加ボタンをヘッダー右側へ移動し、プロフィール画面とデザインを統一。
 * V1.2.2 - 'use client' を先頭に移動。
 */

import React, {
  useState,
  useEffect,
} from 'react'
import Link from 'next/link'

import { getRegistrationGroups } from '@/utils/facilityHelpers'
import type { RegistrationGroup } from '@/types/facility'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
  row,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageFacilities } from '@/utils/auth'

export default function GroupsPage() {
  const [groups, setGroups] = useState<RegistrationGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 認証・権限チェック
  const { userRoles, isLoading: authLoading } = useAuthCheck()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const list = await getRegistrationGroups()
        setGroups(list ?? [])
      } catch (error) {
        console.error('Failed to fetch groups:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGroups()
  }, [])

  if (isLoading || authLoading) {
    return (
      <div style={container}>
        <div style={{ padding: spacing.md, paddingBottom: 100 }}>
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>登録団体一覧</h1>
          </div>
          <div style={facilityPage.bodyText}>読み込み中...</div>
        </div>
      </div>
    )
  }

  // 施設管理権限があるか判定
  const showAdminButtons = !authLoading && canManageFacilities(userRoles)
  const hasNoGroups = !groups || groups.length === 0

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>
        
        {/* タイトルエリア */}
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>登録団体一覧</h1>
        </div>

        {/* ボタンセクション (プロフィールページと同様の構成) */}
        <div style={{
          ...row.header,
          justifyContent: 'flex-end',
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          {showAdminButtons && (
            <>
              <Link 
                href="/facilities/groups/new" 
                style={{
                  ...button.base,
                  ...button.primary,
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '4px 12px',
                  height: 'auto'
                }}
              >
                ＋新規
              </Link>
              <Link 
                href="/facilities/" 
                style={{
                  ...button.base,
                  ...button.admin,
                  textDecoration: 'none',
                  fontSize: '14px',
                  padding: '4px 12px',
                  height: 'auto'
                }}
              >
                ⚙️管理
              </Link>
            </>
          )}
        </div>

        {/* リスト表示 */}
        {hasNoGroups ? (
          <div style={facilityPage.bodyText}>登録団体がありません</div>
        ) : (
          <div style={facilityPage.list}>
            {groups.map((group) => (
              <div key={group.id} style={card}>
                <div style={facilityPage.itemStack}>
                  <span style={facilityPage.label}>団体名</span>
                  <Link
                    href={`/facilities/groups/${group.id}`}
                    style={facilityPage.value}
                  >
                    {group.registration_club_name}
                  </Link>
                </div>
                <div style={{ ...facilityPage.itemStack, marginTop: spacing.sm }}>
                  <span style={facilityPage.label}>団体番号</span>
                  <span style={facilityPage.value}>
                    {group.registration_club_number ?? '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}