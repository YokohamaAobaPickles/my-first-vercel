/**
 * Filename: src/app/facilities/reservations/new/page.tsx
 * Version: V1.1.1
 * Update: 2026-03-13
 * Remarks: 
 * V1.1.1 - 予約者名を自由入力テキストとして実装（将来的な会員紐付けの余地あり）。
 * V1.1.0 - 施設選択、団体選択、支払い期限等の不足項目を追加。
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  createReservation,
  getFacilities,
  getRegistrationGroups
} from '@/utils/facilityHelpers'
import type { Facility, RegistrationGroup } from '@/types/facility'
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

const toStr = (s: string) => s.trim() === '' ? null : s.trim()
const toNum = (s: string) => {
  const n = Number(s.trim())
  return Number.isNaN(n) ? 0 : n
}

export default function NewReservationPage() {
  const router = useRouter()

  const [facilities, setFacilities] = useState<Facility[]>([])
  const [groups, setGroups] = useState<RegistrationGroup[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // フォームステート
  const [facilityId, setFacilityId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [reservationDate, setReservationDate] = useState('')
  const [reservationTimeSlot, setReservationTimeSlot] = useState('')
  const [reservedCourts, setReservedCourts] = useState('1')
  const [reservedFee, setReservedFee] = useState('0')
  const [reservationNumber, setReservationNumber] = useState('')
  const [reservationLimit, setReservationLimit] = useState('')
  const [reserverName, setReserverName] = useState('')
  const [lotteryResults, setLotteryResults] = useState('')
  const [reservationNotes, setReservationNotes] = useState('')

  useEffect(() => {
    const loadMasters = async () => {
      try {
        console.log('[DEBUG] データ取得開始...')

        // 直列で実行して、それぞれの戻り値を個別に確認
        const fData = await getFacilities()
        console.log('[DEBUG] 施設データ受信:', fData)
        if (fData && fData.length > 0) {
          setFacilities(fData)
        }

        const gData = await getRegistrationGroups()
        console.log('[DEBUG] 団体データ受信:', gData)
        if (gData && gData.length > 0) {
          setGroups(gData)
        }

      } catch (error) {
        console.error('[DEBUG] マスターデータロード失敗:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadMasters()
  }, [])

  const handleSubmit = async () => {
    if (!facilityId) {
      alert('施設を選択してください')
      return
    }

    const payload = {
      facility_id: facilityId,
      registration_group_id: toStr(groupId),
      reservation_date: reservationDate,
      reservation_time_slot: reservationTimeSlot,
      reserved_courts: toNum(reservedCourts) || 1,
      reserved_fee: toNum(reservedFee),
      reservation_number: toStr(reservationNumber),
      reservation_limit: toStr(reservationLimit),
      reserver_name: toStr(reserverName),
      lottery_results: toStr(lotteryResults),
      reservation_notes: toStr(reservationNotes),
    }

    const result = await createReservation(payload)
    if (result) {
      router.push('/facilities/reservations')
    }
  }

  // ロードが終わるまで表示を待機
  if (!isLoaded) {
    return (
      <div style={container}>
        <div style={{ padding: spacing.md }}>
          <div style={facilityPage.bodyText}>マスターデータを読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設予約登録</h1>
        </div>

        <div style={card}>
          {/* 施設選択 */}
          <div style={facilityPage.itemStack}>
            <label htmlFor="facility_id" style={facilityPage.label}>施設名 (必須)</label>
            <select
              id="facility_id"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              style={{
                ...facilityPage.value,
                color: '#ffffff',           // 選択後の文字色
                backgroundColor: '#0b242b', // 背景色を明示
              }}            >
              <option value="">施設を選択してください ({facilities.length}件)</option>
              {facilities.map(f => (
                <option
                  key={f.id}
                  value={f.id}
                  style={{ color: 'white', backgroundColor: '#0b242b'}} // オプションリスト内の文字色を黒に強制
                >
                  {f.facility_name}
                </option>
              ))}
            </select>
          </div>

          {/* 予約団体選択 */}
          <div style={itemStackStyle}>
            <label htmlFor="group_id" style={facilityPage.label}>予約団体</label>
            <select
              id="group_id"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              style={{
                ...facilityPage.value,
                color: '#ffffff',
                backgroundColor: '#0b242b',
              }}
            >
              <option value="">団体を選択 ({groups.length}件)</option>
              {groups.map(g => (
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
            <label htmlFor="reserver_name" style={facilityPage.label}>予約者名</label>
            <input
              id="reserver_name"
              type="text"
              placeholder="氏名を入力してください"
              value={reserverName}
              onChange={(e) => setReserverName(e.target.value)}
              style={{ ...facilityPage.value, backgroundColor: '#0b242b', color: '#fff' }}
            />
          </div>

          <hr style={{ margin: `${spacing.lg}px 0`, border: '0.5px solid #444' }} />

          {/* 日時・詳細エリア */}
          <div style={itemStackStyle}>
            <label htmlFor="reservation_date" style={facilityPage.label}>予約日</label>
            <input
              id="reservation_date"
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_time_slot" style={facilityPage.label}>時間枠</label>
            <input
              id="reservation_time_slot"
              type="text"
              placeholder="例: 13:00-15:00"
              value={reservationTimeSlot}
              onChange={(e) => setReservationTimeSlot(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reserved_courts" style={facilityPage.label}>コート数</label>
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
            <label htmlFor="reserved_fee" style={facilityPage.label}>費用</label>
            <input
              id="reserved_fee"
              type="number"
              min={0}
              value={reservedFee}
              onChange={(e) => setReservedFee(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_limit" style={facilityPage.label}>支払い期限</label>
            <input
              id="reservation_limit"
              type="date"
              value={reservationLimit}
              onChange={(e) => setReservationLimit(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_number" style={facilityPage.label}>予約番号</label>
            <input
              id="reservation_number"
              type="text"
              value={reservationNumber}
              onChange={(e) => setReservationNumber(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="lottery_results" style={facilityPage.label}>当落情報</label>
            <input
              id="lottery_results"
              type="text"
              placeholder="当選/落選など"
              value={lotteryResults}
              onChange={(e) => setLotteryResults(e.target.value)}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="reservation_notes" style={facilityPage.label}>予約メモ</label>
            <textarea
              id="reservation_notes"
              value={reservationNotes}
              onChange={(e) => setReservationNotes(e.target.value)}
              style={{ ...facilityPage.bodyText, width: '100%', backgroundColor: 'transparent', color: '#fff', border: '1px solid #444' }}
              rows={4}
            />
          </div>

          {/* アクションボタン */}
          <div style={{ marginTop: spacing.lg, display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{ ...button.base, ...button.primary }}
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
                alignItems: 'center'
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