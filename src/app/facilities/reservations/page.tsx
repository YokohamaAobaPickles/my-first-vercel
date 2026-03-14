'use client'

/**
 * Filename: src/app/facilities/reservations/page.tsx
 * Version: V1.3.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.3.0 - 施設名表示を facilities オブジェクトからの取得に修正。型定義を整理。
 * V1.2.1 - FacilityReservation 型に facility_name が欠落していたための型エラーを修正。
 * V1.2.0 - 一覧の表示項目を2行構成に変更し、予約日に詳細リンクを設定。
 */

'use client'

import React, {
  useState,
  useEffect,
} from 'react'
import Link from 'next/link'

import { getReservations } from '@/utils/facilityHelpers'
import type { FacilityReservation } from '@/types/facility'
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

// 施設情報をネストして保持する型定義
interface ReservationWithFacility extends FacilityReservation {
  facilities?: {
    facility_name: string;
  } | null;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<
    ReservationWithFacility[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  const { userRoles, isLoading: authLoading } = useAuthCheck()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // API側(facilityApi)で結合クエリを実行しているため、
        // 型アサーションで facilities を含む型として扱う
        const list = await getReservations() as ReservationWithFacility[]
        setReservations(list ?? [])
      } catch (error) {
        console.error('Failed to fetch reservations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [])

  if (isLoading || authLoading) {
    return (
      <div style={container}>
        <div style={{ padding: spacing.md, paddingBottom: 100 }}>
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>施設予約一覧</h1>
          </div>
          <div style={facilityPage.bodyText}>読み込み中...</div>
        </div>
      </div>
    )
  }

  const showAdminButtons = !authLoading && canManageFacilities(userRoles)
  const hasNoReservations = !reservations || reservations.length === 0

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設予約一覧</h1>
        </div>

        <div style={{
          ...row.header,
          justifyContent: 'flex-end',
          gap: spacing.sm,
          marginBottom: spacing.md
        }}>
          {showAdminButtons && (
            <>
              <Link 
                href="/facilities/reservations/new" 
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

        {hasNoReservations ? (
          <div style={facilityPage.bodyText}>予約情報がありません</div>
        ) : (
          <div style={facilityPage.list}>
            {reservations.map((res) => (
              <div key={res.id} style={card}>
                {/* 1行目：施設名とコート数 */}
                <div style={facilityPage.itemStack}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <div>
                      <span style={facilityPage.label}>施設名 </span>
                      <span style={facilityPage.value}>
                        {/* 修正：結合データの名称を表示 */}
                        {res.facilities?.facility_name ?? '施設名不明'}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={facilityPage.label}>コート数：</span>
                      <span style={facilityPage.value}>
                        {res.reserved_courts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2行目：予約日（リンク）と予約時間 */}
                <div 
                  style={{ 
                    ...facilityPage.itemStack, 
                    marginTop: spacing.sm 
                  }}
                >
                  <div style={{ display: 'flex', gap: spacing.md }}>
                    <div>
                      <span style={facilityPage.label}>予約日 </span>
                      <Link
                        href={`/facilities/reservations/${res.id}`}
                        style={{ 
                          ...facilityPage.value, 
                          color: '#3b82f6', 
                          textDecoration: 'underline' 
                        }}
                      >
                        {res.reservation_date}
                      </Link>
                    </div>
                    <div>
                      <span style={facilityPage.label}>予約時間 </span>
                      <span style={facilityPage.value}>
                        {res.reservation_time_slot}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}