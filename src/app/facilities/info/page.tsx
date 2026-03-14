'use client'

/**
 * Filename: src/app/facilities/info/page.tsx
 * Version: V1.3.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.3.0 - ヘッダー右側に [＋新規] と [⚙️管理] ボタンを追加しレイアウトを統一。
 * V1.2.0 - クライアントコンポーネント化し、権限に応じた管理ボタン表示を実装。
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { getFacilities } from '@/utils/facilityHelpers'
import { Facility } from '@/types/facility'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageFacilities } from '@/utils/auth'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
  row,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [fetching, setFetching] = useState(true)
  
  // 権限チェックフック
  const { userRoles, isLoading: authLoading } = useAuthCheck()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFacilities()
        setFacilities(data)
      } catch (error) {
        console.error('Failed to fetch facilities:', error)
      } finally {
        setFetching(false)
      }
    }
    loadData()
  }, [])

  // 施設管理権限があるか判定（System Admin, 会長, 副会長）
  const showAdminButtons = !authLoading && canManageFacilities(userRoles)
  const hasNoFacilities = !fetching && facilities.length === 0

  if (fetching || authLoading) {
    return (
      <div style={container}>
        <div style={{ padding: spacing.md }}>
          読み込み中...
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div
        style={{
          padding: spacing.md,
          paddingBottom: 100,
        }}
      >
        {/* タイトルエリア */}
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設一覧</h1>
        </div>

        {/* ボタンセクション：管理権限がある場合のみ右寄せで表示 */}
        <div style={{
          ...row.header,
          justifyContent: 'flex-end',
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          {showAdminButtons && (
            <>
              <Link 
                href="/facilities/info/new" 
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

        {/* 施設リスト */}
        {hasNoFacilities ? (
          <div style={facilityPage.bodyText}>
            施設が登録されていません
          </div>
        ) : (
          <div style={facilityPage.list}>
            {facilities.map((facility) => (
              <div
                key={facility.id}
                style={card}
              >
                <div style={facilityPage.itemStack}>
                  <span style={facilityPage.label}>施設名</span>
                  <Link
                    href={`/facilities/info/${facility.id}`}
                    style={facilityPage.value}
                  >
                    {facility.facility_name}
                  </Link>
                </div>
                <div
                  style={{
                    ...facilityPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={facilityPage.label}>電話番号</span>
                  <span style={facilityPage.value}>
                    {facility.phone?.trim() || '-'}
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