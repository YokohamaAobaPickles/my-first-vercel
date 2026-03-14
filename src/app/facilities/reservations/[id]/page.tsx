/**
 * Filename: src/app/facilities/reservations/[id]/page.tsx
 * Version: V1.1.1
 * Update: 2026-03-13
 * Remarks: 
 * V1.1.1 - TypeScript の型エラーを修正。FacilityReservation を適切に拡張。
 * V1.1.0 - 施設名、予約団体、予約者名の表示を追加。
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import type { FacilityReservation } from '@/types/facility'
import { getReservationById, deleteReservation } from '@/utils/facilityHelpers'
import { container, card, spacing, button, pageHeader } from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

// 型定義の修正：interface ではなく型エイリアスを使用し、FacilityReservation を継承
type ReservationWithNames = FacilityReservation & {
  facilities?: {
    facility_name: string;
  };
  registration_groups?: {
    registration_club_name: string;
  };
};

function emptyStr(v: string | null | undefined): string {
  return v != null && String(v).trim() !== '' ? String(v) : '-'
}

function emptyNum(v: number | null | undefined): string {
  return v != null && !Number.isNaN(v) ? String(v) : '-'
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : ''

  // ステートの型指定を更新
  const [reservation, setReservation] = useState<ReservationWithNames | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }
      // getReservationById が返す型との整合性をとるため as でキャスト
      const data = await getReservationById(id) as ReservationWithNames | null
      setReservation(data)
      setIsLoading(false)
    }
    fetchReservation()
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('この予約情報を削除してもよろしいですか？')) return

    const result = await deleteReservation(id)
    if (result) {
      router.push('/facilities/reservations')
    }
  }

  if (isLoading) return <div style={container}><div style={{padding: spacing.md}}>読み込み中...</div></div>
  if (!reservation) return <div style={container}><div style={{padding: spacing.md}}>予約が見つかりません。</div></div>

  const itemStackStyle = { ...facilityPage.itemStack, marginTop: spacing.md }

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設予約詳細</h1>
        </div>

        <div style={card}>
          {/* 追加項目: 施設名 */}
          <div style={facilityPage.itemStack}>
            <span style={facilityPage.label}>施設名</span>
            <span style={facilityPage.value}>
              {emptyStr(reservation.facilities?.facility_name)}
            </span>
          </div>

          {/* 追加項目: 予約団体 */}
          <div style={itemStackStyle}>
            <span style={facilityPage.label}>予約団体</span>
            <span style={facilityPage.value}>
              {emptyStr(reservation.registration_groups?.registration_club_name)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>予約日</span>
            <span style={facilityPage.value}>{emptyStr(reservation.reservation_date)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>時間枠</span>
            <span style={facilityPage.value}>{emptyStr(reservation.reservation_time_slot)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>コート数</span>
            <span style={facilityPage.value}>{emptyNum(reservation.reserved_courts)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>予約番号</span>
            <span style={facilityPage.value}>{emptyStr(reservation.reservation_number)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>費用</span>
            <span style={facilityPage.value}>{emptyNum(reservation.reserved_fee)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>支払い期限</span>
            <span style={facilityPage.value}>{emptyStr(reservation.reservation_limit)}</span>
          </div>

          {/* 追加項目: 予約者名 */}
          <div style={itemStackStyle}>
            <span style={facilityPage.label}>予約者名</span>
            <span style={facilityPage.value}>{emptyStr(reservation.reserver_name)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>当落情報</span>
            <span style={facilityPage.value}>{emptyStr(reservation.lottery_results)}</span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>予約メモ</span>
            <div style={facilityPage.bodyText}>{emptyStr(reservation.reservation_notes)}</div>
          </div>

          <div style={{ marginTop: spacing.lg, display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
            <Link href={`/facilities/reservations/${id}/edit`} style={{ ...button.base, ...button.primary, textDecoration: 'none' }}>
              編集する
            </Link>
            <button type="button" onClick={handleDelete} style={{ ...button.base, ...button.delete }}>
              削除する
            </button>
            <Link href="/facilities/reservations" style={{ ...button.base, ...button.secondary, textDecoration: 'none' }}>
              一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}