/**
 * Filename: src/app/facilities/info/edit/[id]/page.tsx
 * Version: V1.2.0
 * Update: 2026-03-05
 * Remarks: new/page.tsx をベースに全フィールド対応・getFacilityById/updateFacility。
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
  getFacilityById,
  updateFacility,
  deleteFacility,
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

function toNum(
  s: string,
): number | null {
  const t = s.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isNaN(n) ? null : n
}

function toStr(
  s: string,
): string | null {
  const t = s.trim()
  return t === '' ? null : t
}

export default function EditFacilityPage() {
  const router = useRouter()
  const params = useParams()

  const facilityId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  const [facilityName, setFacilityName] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [facilityNotes, setFacilityNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [facilityUrl, setFacilityUrl] = useState('')
  const [facilityFeeDesc, setFacilityFeeDesc] = useState('')
  const [courtNumbers, setCourtNumbers] = useState('')
  const [lotteryDateDesc, setLotteryDateDesc] = useState('')
  const [registrationDate, setRegistrationDate] = useState('')
  const [renewalDate, setRenewalDate] = useState('')
  const [registrationFee, setRegistrationFee] = useState('')
  const [annualFee, setAnnualFee] = useState('')
  const [parkingCapacity, setParkingCapacity] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFacility = async () => {
      if (!facilityId) return

      const data = await getFacilityById(facilityId)

      if (!data) return

      setFacilityName(data.facility_name || '')
      setAddress(data.address ?? '')
      setMapUrl(data.map_url ?? '')
      setFacilityNotes(data.facility_notes ?? '')
      setPhone(data.phone ?? '')
      setEmail(data.email ?? '')
      setFacilityUrl(data.facility_url ?? '')
      setFacilityFeeDesc(data.facility_fee_desc ?? '')
      setCourtNumbers(data.court_numbers ?? '')
      setLotteryDateDesc(data.lottery_date_desc ?? '')
      setRegistrationDate(data.registration_date ?? '')
      setRenewalDate(data.renewal_date ?? '')
      setRegistrationFee(
        data.registration_fee != null ? String(data.registration_fee) : '',
      )
      setAnnualFee(
        data.annual_fee != null ? String(data.annual_fee) : '',
      )
      setParkingCapacity(
        data.parking_capacity != null ? String(data.parking_capacity) : '',
      )
      setIsLoading(false)
    }

    fetchFacility()
  }, [facilityId])

  const handleChangeName = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setFacilityName(e.target.value)
  }

  const handleChangeAddress = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setAddress(e.target.value)
  }

  const handleChangeMapUrl = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setMapUrl(e.target.value)
  }

  const handleChangeNotes = (
    e: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFacilityNotes(e.target.value)
  }

  const handleChangePhone = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setPhone(e.target.value)
  }

  const handleChangeEmail = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setEmail(e.target.value)
  }

  const handleChangeFacilityUrl = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setFacilityUrl(e.target.value)
  }

  const handleChangeFacilityFeeDesc = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setFacilityFeeDesc(e.target.value)
  }

  const handleChangeCourtNumbers = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setCourtNumbers(e.target.value)
  }

  const handleChangeLotteryDateDesc = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setLotteryDateDesc(e.target.value)
  }

  const handleChangeRegistrationDate = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setRegistrationDate(e.target.value)
  }

  const handleChangeRenewalDate = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setRenewalDate(e.target.value)
  }

  const handleChangeRegistrationFee = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setRegistrationFee(e.target.value)
  }

  const handleChangeAnnualFee = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setAnnualFee(e.target.value)
  }

  const handleChangeParkingCapacity = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setParkingCapacity(e.target.value)
  }

  const handleUpdate = async () => {
    if (!facilityId) return

    const payload = {
      facility_name: facilityName,
      address: toStr(address),
      map_url: toStr(mapUrl),
      facility_notes: toStr(facilityNotes),
      phone: toStr(phone),
      email: toStr(email),
      facility_url: toStr(facilityUrl),
      facility_fee_desc: toStr(facilityFeeDesc),
      court_numbers: toStr(courtNumbers),
      lottery_date_desc: toStr(lotteryDateDesc),
      registration_date: toStr(registrationDate),
      renewal_date: toStr(renewalDate),
      registration_fee: toNum(registrationFee),
      annual_fee: toNum(annualFee),
      parking_capacity: toNum(parkingCapacity),
    }

    const result = await updateFacility(facilityId, payload)

    if (result) {
      router.push(`/facilities/info/${facilityId}`)
    }
  }

  const handleDelete = async () => {
    if (!facilityId) return

    const ok = window.confirm(
      'この施設を削除しますか？',
    )

    if (!ok) return

    const result = await deleteFacility(facilityId)

    if (result) {
      router.push('/facilities')
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
              施設編集
            </h1>
          </div>
          <div>読み込み中...</div>
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
            施設編集
          </h1>
        </div>

        <div style={card}>
          <div style={facilityPage.itemStack}>
            <label
              htmlFor="facility_name"
              style={facilityPage.label}
            >
              施設名（必須）
            </label>
            <input
              id="facility_name"
              type="text"
              value={facilityName}
              onChange={handleChangeName}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="address" style={facilityPage.label}>
              住所
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={handleChangeAddress}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="map_url" style={facilityPage.label}>
              Google Map URL
            </label>
            <input
              id="map_url"
              type="text"
              value={mapUrl}
              onChange={handleChangeMapUrl}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="phone" style={facilityPage.label}>
              電話番号
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={handleChangePhone}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="email" style={facilityPage.label}>
              メールアドレス
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={handleChangeEmail}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="facility_url" style={facilityPage.label}>
              公式サイトURL
            </label>
            <input
              id="facility_url"
              type="text"
              value={facilityUrl}
              onChange={handleChangeFacilityUrl}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="facility_fee_desc"
              style={facilityPage.label}
            >
              利用料金
            </label>
            <input
              id="facility_fee_desc"
              type="text"
              value={facilityFeeDesc}
              onChange={handleChangeFacilityFeeDesc}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="court_numbers" style={facilityPage.label}>
              コート番号
            </label>
            <input
              id="court_numbers"
              type="text"
              value={courtNumbers}
              onChange={handleChangeCourtNumbers}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="lottery_date_desc"
              style={facilityPage.label}
            >
              抽選日
            </label>
            <input
              id="lottery_date_desc"
              type="text"
              value={lotteryDateDesc}
              onChange={handleChangeLotteryDateDesc}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_date"
              style={facilityPage.label}
            >
              団体登録日
            </label>
            <input
              id="registration_date"
              type="text"
              value={registrationDate}
              onChange={handleChangeRegistrationDate}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="renewal_date" style={facilityPage.label}>
              団体更新期限
            </label>
            <input
              id="renewal_date"
              type="text"
              value={renewalDate}
              onChange={handleChangeRenewalDate}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_fee"
              style={facilityPage.label}
            >
              団体登録料
            </label>
            <input
              id="registration_fee"
              type="text"
              inputMode="numeric"
              value={registrationFee}
              onChange={handleChangeRegistrationFee}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label htmlFor="annual_fee" style={facilityPage.label}>
              団体年会費
            </label>
            <input
              id="annual_fee"
              type="text"
              inputMode="numeric"
              value={annualFee}
              onChange={handleChangeAnnualFee}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="parking_capacity"
              style={facilityPage.label}
            >
              駐車場台数
            </label>
            <input
              id="parking_capacity"
              type="text"
              inputMode="numeric"
              value={parkingCapacity}
              onChange={handleChangeParkingCapacity}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="facility_notes"
              style={facilityPage.label}
            >
              備考
            </label>
            <textarea
              id="facility_notes"
              value={facilityNotes}
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
              onClick={handleUpdate}
              style={{
                ...button.base,
                ...button.primary,
              }}
            >
              更新
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                ...button.base,
                ...button.delete,
              }}
            >
              削除
            </button>
            <Link
              href="/facilities"
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
