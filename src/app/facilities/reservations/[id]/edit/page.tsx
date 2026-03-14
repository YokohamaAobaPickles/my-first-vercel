/**
 * Filename: src/app/facilities/reservations/[id]/edit/page.tsx
 * Version: V1.1.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.1.0 - 施設、予約団体、支払い期限、予約者名の編集に対応。F-22 機能を強化。
 * V1.0.0 - F-22 施設予約情報の更新。
 */

'use client'

import React, {
  useState,
  useEffect,
  ChangeEvent,
} from 'react'
import Link from 'next/link'
import {
  useRouter,
  useParams,
} from 'next/navigation'

import {
  getReservationById,
  updateReservation,
  getFacilities,
  getRegistrationGroups,
} from '@/utils/facilityHelpers'
import {
  Facility,
  RegistrationGroup,
} from '@/types/facility'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

const itemStackStyle = {
  ...facilityPage.itemStack,
  marginTop: spacing.md,
}

function toStr(
  s: string,
): string | null {
  const t = s.trim()
  return t === '' ? null : t
}

function toNum(
  s: string,
): number {
  const n = Number(s.trim())
  return Number.isNaN(n) ? 0 : n
}

export default function EditReservationPage() {
  const router = useRouter()
  const params = useParams()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  // マスターデータ用
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [groups, setGroups] = useState<RegistrationGroup[]>([])

  // フォーム用ステート
  const [facilityId, setFacilityId] = useState('')
  const [registrationGroupId, setRegistrationGroupId] = useState('')
  const [reservationDate, setReservationDate] = useState('')
  const [reservationTimeSlot, setReservationTimeSlot] = useState('')
  const [reservedCourts, setReservedCourts] = useState('')
  const [reservedFee, setReservedFee] = useState('')
  const [reservationLimit, setReservationLimit] = useState('')
  const [reserverName, setReserverName] = useState('')
  const [reservationNumber, setReservationNumber] = useState('')
  const [lotteryResults, setLotteryResults] = useState('')
  const [reservationNotes, setReservationNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      // マスターデータと予約データを並列取得
      const [facs, grps, res] = await Promise.all([
        getFacilities(),
        getRegistrationGroups(),
        getReservationById(id)
      ])

      setFacilities(facs)
      setGroups(grps)

      if (res) {
        setFacilityId(res.facility_id ?? '')
        setRegistrationGroupId(res.registration_group_id ?? '')
        setReservationDate(res.reservation_date ?? '')
        setReservationTimeSlot(res.reservation_time_slot ?? '')
        setReservedCourts(
          res.reserved_courts != null ? String(res.reserved_courts) : ''
        )
        setReservedFee(
          res.reserved_fee != null ? String(res.reserved_fee) : ''
        )
        setReservationLimit(res.reservation_limit ?? '')
        setReserverName(res.reserver_name ?? '')
        setReservationNumber(res.reservation_number ?? '')
        setLotteryResults(res.lottery_results ?? '')
        setReservationNotes(res.reservation_notes ?? '')
      }
      setIsLoading(false)
    }

    fetchData()
  }, [id])

  const handleSubmit = async () => {
    if (!id) return
    if (!facilityId) {
      alert('施設を選択してください。')
      return
    }

    const payload = {
      facility_id: facilityId,
      registration_group_id: toStr(registrationGroupId),
      reservation_date: reservationDate,
      reservation_time_slot: reservationTimeSlot,
      reserved_courts: toNum(reservedCourts) || 1,
      reserved_fee: toNum(reservedFee),
      reservation_limit: toStr(reservationLimit),
      reserver_name: toStr(reserverName),
      reservation_number: toStr(reservationNumber),
      lottery_results: toStr(lotteryResults),
      reservation_notes: toStr(reservationNotes),
    }

    const result = await updateReservation(id, payload)

    if (result) {
      router.push(`/facilities/reservations/${id}`)
    }
  }

  if (isLoading) {
    return (
      <div style={container}>
        <div style={{ padding: spacing.md, paddingBottom: 100 }}>
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>施設予約の編集</h1>
          </div>
          <div style={facilityPage.bodyText}>読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設予約の編集</h1>
        </div>

        <div style={card}>
          {/* 施設名（セレクトボックス） */}
          <div style={facilityPage.itemStack}>
            <label htmlFor="facility_id" style={facilityPage.label}>
              施設名
            </label>
            <select
              id="facility_id"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              style={{
                ...facilityPage.value,
                color: '#ffffff',           // 選択後の文字色
                backgroundColor: '#0b242b', // 背景色を明示
              }}
            >
              <option value="">施設を選択してください</option>
              {facilities.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                  style={{ color: 'white', backgroundColor: '#0b242b' }} // オプションリスト内の文字色を黒に強制
                >
                  {f.facility_name}
                </option>
              ))}
            </select>
          </div>

          {/* 予約団体（セレクトボックス） */}
          <div style={itemStackStyle}>
            <label htmlFor="registration_group_id" style={facilityPage.label}>
              予約団体
            </label>
            <select
              id="registration_group_id"
              value={registrationGroupId}
              onChange={(e) => setRegistrationGroupId(e.target.value)}
              style={{
                ...facilityPage.value,
                color: '#ffffff',           // 選択後の文字色
                backgroundColor: '#0b242b', // 背景色を明示
              }}
            >
              <option value="">団体を選択しない</option>
              {groups.map((g) => (
                <option
                  key={g.id}
                  value={g.id}
                  style={{ color: 'white', backgroundColor: '#0b242b' }}
                >
                  {g.registration_club_name}
                </option>
              ))}
            </select>
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_date" style={facilityPage.label}>
              予約日
            </label>
            <input
              id="reservation_date"
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_time_slot" style={facilityPage.label}>
              時間枠
            </label>
            <input
              id="reservation_time_slot"
              type="text"
              value={reservationTimeSlot}
              onChange={(e) => setReservationTimeSlot(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reserved_courts" style={facilityPage.label}>
              コート数
            </label>
            <input
              id="reserved_courts"
              type="number"
              min={1}
              value={reservedCourts}
              onChange={(e) => setReservedCourts(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reserved_fee" style={facilityPage.label}>
              費用
            </label>
            <input
              id="reserved_fee"
              type="number"
              min={0}
              value={reservedFee}
              onChange={(e) => setReservedFee(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          {/* 支払い期限 */}
          <div style={itemStackStyle}>
            <label htmlFor="reservation_limit" style={facilityPage.label}>
              支払い期限
            </label>
            <input
              id="reservation_limit"
              type="date"
              value={reservationLimit}
              onChange={(e) => setReservationLimit(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          {/* 予約者名 */}
          <div style={itemStackStyle}>
            <label htmlFor="reserver_name" style={facilityPage.label}>
              予約者名
            </label>
            <input
              id="reserver_name"
              type="text"
              value={reserverName}
              onChange={(e) => setReserverName(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_number" style={facilityPage.label}>
              予約番号
            </label>
            <input
              id="reservation_number"
              type="text"
              value={reservationNumber}
              onChange={(e) => setReservationNumber(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="lottery_results" style={facilityPage.label}>
              当落情報
            </label>
            <input
              id="lottery_results"
              type="text"
              value={lotteryResults}
              onChange={(e) => setLotteryResults(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_notes" style={facilityPage.label}>
              予約メモ
            </label>
            <textarea
              id="reservation_notes"
              value={reservationNotes}
              onChange={(e) => setReservationNotes(e.target.value)}
              style={facilityPage.bodyText}
              rows={4}
            />
          </div>

          <div
            style={{
              marginTop: spacing.lg,
              display: 'flex',
              gap: spacing.sm,
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              style={{ ...button.base, ...button.primary }}
            >
              保存する
            </button>
            <Link
              href={`/facilities/reservations/${id}`}
              style={{
                ...button.base,
                ...button.secondary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              キャンセル
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}