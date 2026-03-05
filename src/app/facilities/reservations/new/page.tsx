/**
 * Filename: src/app/facilities/reservations/new/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-21 施設予約情報の登録。FacilityReservation に基づくフォーム。
 */

'use client'

import React, {
  useState,
  ChangeEvent,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createReservation } from '@/utils/facilityHelpers'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

const itemStackStyle = {
  ...memberPage.itemStack,
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

export default function NewReservationPage() {
  const router = useRouter()

  const [reservationDate, setReservationDate] = useState('')
  const [reservationTimeSlot, setReservationTimeSlot] = useState('')
  const [reservedCourts, setReservedCourts] = useState('')
  const [reservedFee, setReservedFee] = useState('')
  const [reservationNumber, setReservationNumber] = useState('')
  const [lotteryResults, setLotteryResults] = useState('')
  const [reservationNotes, setReservationNotes] = useState('')

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
    const payload = {
      facility_id: '',
      registration_group_id: null as string | null,
      reservation_date: reservationDate,
      reservation_time_slot: reservationTimeSlot,
      reserved_courts: toNum(reservedCourts) || 1,
      reserved_fee: toNum(reservedFee),
      reservation_number: toStr(reservationNumber),
      reservation_limit: null as string | null,
      reserver_name: null as string | null,
      lottery_results: toStr(lotteryResults),
      reservation_notes: toStr(reservationNotes),
    }

    const result = await createReservation(payload)

    if (result) {
      router.push('/facilities/reservations')
    }
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
            施設予約登録
          </h1>
        </div>

        <div style={card}>
          <div style={memberPage.itemStack}>
            <label
              htmlFor="reservation_date"
              style={memberPage.label}
            >
              予約日
            </label>
            <input
              id="reservation_date"
              type="date"
              value={reservationDate}
              onChange={handleChangeDate}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_time_slot"
              style={memberPage.label}
            >
              時間枠
            </label>
            <input
              id="reservation_time_slot"
              type="text"
              value={reservationTimeSlot}
              onChange={handleChangeTimeSlot}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reserved_courts"
              style={memberPage.label}
            >
              コート数
            </label>
            <input
              id="reserved_courts"
              type="number"
              min={1}
              value={reservedCourts}
              onChange={handleChangeCourts}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reserved_fee"
              style={memberPage.label}
            >
              費用
            </label>
            <input
              id="reserved_fee"
              type="number"
              min={0}
              value={reservedFee}
              onChange={handleChangeFee}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_number"
              style={memberPage.label}
            >
              予約番号
            </label>
            <input
              id="reservation_number"
              type="text"
              value={reservationNumber}
              onChange={handleChangeNumber}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="lottery_results"
              style={memberPage.label}
            >
              当落情報
            </label>
            <input
              id="lottery_results"
              type="text"
              value={lotteryResults}
              onChange={handleChangeLottery}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="reservation_notes"
              style={memberPage.label}
            >
              予約メモ
            </label>
            <textarea
              id="reservation_notes"
              value={reservationNotes}
              onChange={handleChangeNotes}
              style={memberPage.bodyText}
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
              href="/facilities/reservations"
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
