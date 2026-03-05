/**
 * Filename: src/app/facilities/page.tsx
 * Version: V1.2.0
 * Update: 2026-03-05
 * Remarks: 
 * V1.1.0 - 表示項目を施設名と電話番号に絞り、詳細リンクを追加。
 * V1.2.0 - クライアントコンポーネント化し、権限に応じた管理ボタン表示を実装。
 */

'use client'

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

  const hasNoFacilities = !fetching && facilities.length === 0
  const showAdminButton = !authLoading && canManageFacilities(userRoles)

  if (fetching || authLoading) {
    return <div style={container}>読み込み中...</div>
  }

  return (
    <div style={container}>
      <div
        style={{
          padding: spacing.md,
          paddingBottom: 100,
        }}
      >
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設一覧</h1>
          {/* 管理権限がある場合のみ表示 */}
          {showAdminButton && (
            <Link
              href="/facilities/admin"
              style={{
                ...button.base,
                ...button.primary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                padding: `0 ${spacing.md}px`,
              }}
            >
              管理画面へ
            </Link>
          )}
        </div>

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
                    href={`/facilities/${facility.id}`}
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