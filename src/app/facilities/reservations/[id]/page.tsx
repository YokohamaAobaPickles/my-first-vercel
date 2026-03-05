/**
 * Filename: src/app/facilities/reservations/[id]/page.tsx
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks: F-25 施設予約詳細参照。F-23 施設予約情報の削除機能を追加。
 */

'use client'

import React, {
  useState,
  useEffect,
} from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  getReservationById,
  deleteReservation,
} from '@/utils/facilityHelpers'
import type { FacilityReservation } from '@/types/facility'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

function emptyStr(
  v: string | null | undefined,
): string {
  return v != null && String(v).trim() !== ''
    ? String(v)
    : '-'
}

function emptyNum(
  v: number | null | undefined,
): string {
  return v != null && !Number.isNaN(v)
    ? String(v)
    : '-'
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  const [reservation, setReservation] =
    useState<FacilityReservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      const data = await getReservationById(id)
      setReservation(data ?? null)
      setIsLoading(false)
    }

    fetchReservation()
  }, [id])

  const handleDelete = async () => {
    if (!id) return

    const ok = window.confirm(
      'この予約情報を削除してもよろしいですか？',
    )

    if (!ok) return

    const result = await deleteReservation(id)

    if (result) {
      router.push('/facilities/reservations')
    }
  }

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
              施設予約詳細
            </h1>
          </div>
          <div style={memberPage.bodyText}>
            読み込み中...
          </div>
        </div>
      </div>
    )
  }

  if (!reservation) {
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
              施設予約詳細
            </h1>
          </div>
          <div style={memberPage.bodyText}>
            予約が見つかりません。
          </div>
          <div style={{ marginTop: spacing.lg }}>
            <Link
              href="/facilities/reservations"
              style={{
                ...button.base,
                ...button.secondary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const itemStackStyle = {
    ...memberPage.itemStack,
    marginTop: spacing.md,
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
          <h1 style={pageHeader.title}>
            施設予約詳細
          </h1>
        </div>

        <div style={card}>
          <div style={memberPage.itemStack}>
            <span style={memberPage.label}>
              予約日
            </span>
            <span style={memberPage.value}>
              {emptyStr(reservation.reservation_date)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              時間枠
            </span>
            <span style={memberPage.value}>
              {emptyStr(reservation.reservation_time_slot)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              コート数
            </span>
            <span style={memberPage.value}>
              {emptyNum(reservation.reserved_courts)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              予約番号
            </span>
            <span style={memberPage.value}>
              {emptyStr(reservation.reservation_number)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              費用
            </span>
            <span style={memberPage.value}>
              {emptyNum(reservation.reserved_fee)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              支払い期限
            </span>
            <span style={memberPage.value}>
              {emptyStr(reservation.reservation_limit)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              当落情報
            </span>
            <span style={memberPage.value}>
              {emptyStr(reservation.lottery_results)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>
              予約メモ
            </span>
            <div style={memberPage.bodyText}>
              {emptyStr(reservation.reservation_notes)}
            </div>
          </div>

          <div
            style={{
              marginTop: spacing.lg,
              display: 'flex',
              gap: spacing.sm,
              justifyContent: 'flex-end',
            }}
          >
            <Link
              href={`/facilities/reservations/${id}/edit`}
              style={{
                ...button.base,
                ...button.primary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              編集する
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                ...button.base,
                ...button.delete,
              }}
            >
              削除する
            </button>
            <Link
              href="/facilities/reservations"
              style={{
                ...button.base,
                ...button.secondary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
