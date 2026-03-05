/**
 * Filename: src/app/facilities/(admin)/reservations/[id]/edit/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-22 施設予約情報の更新。getReservationById で取得し updateReservation で保存。
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
} from '@/utils/facilityHelpers'
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

  const [reservationDate, setReservationDate] = useState('')
  const [reservationTimeSlot, setReservationTimeSlot] = useState('')
  const [reservedCourts, setReservedCourts] = useState('')
  const [reservedFee, setReservedFee] = useState('')
  const [reservationNumber, setReservationNumber] = useState('')
  const [lotteryResults, setLotteryResults] = useState('')
  const [reservationNotes, setReservationNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      const data = await getReservationById(id)

      if (!data) {
        setIsLoading(false)
        return
      }

      setReservationDate(data.reservation_date ?? '')
      setReservationTimeSlot(data.reservation_time_slot ?? '')
      setReservedCourts(
        data.reserved_courts != null
          ? String(data.reserved_courts)
          : '',
      )
      setReservedFee(
        data.reserved_fee != null
          ? String(data.reserved_fee)
          : '',
      )
      setReservationNumber(data.reservation_number ?? '')
      setLotteryResults(data.lottery_results ?? '')
      setReservationNotes(data.reservation_notes ?? '')
      setIsLoading(false)
    }

    fetchReservation()
  }, [id])

  const handleChangeDate = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setReservationDate(e.target.value)
  }

  const handleChangeTimeSlot = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setReservationTimeSlot(e.target.value)
  }

  const handleChangeCourts = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setReservedCourts(e.target.value)
  }

  const handleChangeFee = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setReservedFee(e.target.value)
  }

  const handleChangeNumber = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setReservationNumber(e.target.value)
  }

  const handleChangeLottery = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setLotteryResults(e.target.value)
  }

  const handleChangeNotes = (
    e: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setReservationNotes(e.target.value)
  }

  const handleSubmit = async () => {
    if (!id) return

    const payload = {
      reservation_date: reservationDate,
      reservation_time_slot: reservationTimeSlot,
      reserved_courts: toNum(reservedCourts) || 1,
      reserved_fee: toNum(reservedFee),
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
        <div
          style={{
            padding: spacing.md,
            paddingBottom: 100,
          }}
        >
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>
              施設予約の編集
            </h1>
          </div>
          <div style={facilityPage.bodyText}>
            読み込み中...
          </div>
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
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>
            施設予約の編集
          </h1>
        </div>

        <div style={card}>
          <div style={facilityPage.itemStack}>
            <label
              htmlFor="reservation_date"
              style={facilityPage.label}
            >
              予約日
            </label>
            <input
              id="reservation_date"
              type="date"
              value={reservationDate}
              onChange={handleChangeDate}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_time_slot"
              style={facilityPage.label}
            >
              時間枠
            </label>
            <input
              id="reservation_time_slot"
              type="text"
              value={reservationTimeSlot}
              onChange={handleChangeTimeSlot}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reserved_courts"
              style={facilityPage.label}
            >
              コート数
            </label>
            <input
              id="reserved_courts"
              type="number"
              min={1}
              value={reservedCourts}
              onChange={handleChangeCourts}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reserved_fee"
              style={facilityPage.label}
            >
              費用
            </label>
            <input
              id="reserved_fee"
              type="number"
              min={0}
              value={reservedFee}
              onChange={handleChangeFee}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_number"
              style={facilityPage.label}
            >
              予約番号
            </label>
            <input
              id="reservation_number"
              type="text"
              value={reservationNumber}
              onChange={handleChangeNumber}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="lottery_results"
              style={facilityPage.label}
            >
              当落情報
            </label>
            <input
              id="lottery_results"
              type="text"
              value={lotteryResults}
              onChange={handleChangeLottery}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_notes"
              style={facilityPage.label}
            >
              予約メモ
            </label>
            <textarea
              id="reservation_notes"
              value={reservationNotes}
              onChange={handleChangeNotes}
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
              style={{
                ...button.base,
                ...button.primary,
              }}
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
