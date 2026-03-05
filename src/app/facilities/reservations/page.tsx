/**
 * Filename: src/app/facilities/reservations/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-24 施設予約情報一覧参照。getReservations で取得しカード表示。
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
  pageHeader,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<
    FacilityReservation[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      const list = await getReservations()
      setReservations(list ?? [])
      setIsLoading(false)
    }

    fetchReservations()
  }, [])

  if (isLoading) {
    return (
      <div style={container}>
        <div
          style={{
            padding: spacing.md,
            paddingBottom: 100,
          }}
        >
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>
              施設予約一覧
            </h1>
          </div>
          <div style={memberPage.bodyText}>
            読み込み中...
          </div>
        </div>
      </div>
    )
  }

  const hasNoReservations =
    !reservations || reservations.length === 0

  return (
    <div style={container}>
      <div
        style={{
          padding: spacing.md,
          paddingBottom: 100,
        }}
      >
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>
            施設予約一覧
          </h1>
        </div>

        {hasNoReservations ? (
          <div style={memberPage.bodyText}>
            予約情報がありません
          </div>
        ) : (
          <div style={memberPage.list}>
            {reservations.map((res) => (
              <div
                key={res.id}
                style={card}
              >
                <div style={memberPage.itemStack}>
                  <span style={memberPage.label}>
                    予約日
                  </span>
                  <Link
                    href={`/facilities/reservations/${res.id}`}
                    style={memberPage.value}
                  >
                    {res.reservation_date}
                  </Link>
                </div>
                <div
                  style={{
                    ...memberPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={memberPage.label}>
                    時間枠
                  </span>
                  <span style={memberPage.value}>
                    {res.reservation_time_slot}
                  </span>
                </div>
                <div
                  style={{
                    ...memberPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={memberPage.label}>
                    コート数
                  </span>
                  <span style={memberPage.value}>
                    {res.reserved_courts}
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
