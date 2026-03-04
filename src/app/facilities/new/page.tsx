/**
 * Filename: src/app/facilities/new/page.tsx
 * Version: V1.1.0
 * Update: 2026-03-04
 * Remarks: Google Map URL (map_url) 入力項目を追加。
 */

'use client'

import React, {
  useState,
  ChangeEvent,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createFacility } from '@/utils/facilityHelpers'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

export default function NewFacilityPage() {
  const router = useRouter()

  const [facilityName, setFacilityName] = useState('')
  const [address, setAddress] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [facilityNotes, setFacilityNotes] = useState('')

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

  const handleSubmit = async () => {
    const payload = {
      facility_name: facilityName,
      address,
      map_url: mapUrl,
      facility_notes: facilityNotes,
      registration_group_id: null,
    }

    const result = await createFacility(payload)

    if (result) {
      router.push('/facilities')
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
            施設新規登録
          </h1>
        </div>

        <div style={card}>
          <div style={memberPage.itemStack}>
            <label
              htmlFor="facility_name"
              style={memberPage.label}
            >
              施設名（必須）
            </label>
            <input
              id="facility_name"
              type="text"
              value={facilityName}
              onChange={handleChangeName}
              style={memberPage.value}
            />
          </div>

          <div
            style={{
              ...memberPage.itemStack,
              marginTop: spacing.md,
            }}
          >
            <label
              htmlFor="address"
              style={memberPage.label}
            >
              住所
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={handleChangeAddress}
              style={memberPage.value}
            />
          </div>

          <div
            style={{
              ...memberPage.itemStack,
              marginTop: spacing.md,
            }}
          >
            <label
              htmlFor="map_url"
              style={memberPage.label}
            >
              Google Map URL
            </label>
            <input
              id="map_url"
              type="text"
              value={mapUrl}
              onChange={handleChangeMapUrl}
              style={memberPage.value}
            />
          </div>

          <div
            style={{
              ...memberPage.itemStack,
              marginTop: spacing.md,
            }}
          >
            <label
              htmlFor="facility_notes"
              style={memberPage.label}
            >
              備考
            </label>
            <textarea
              id="facility_notes"
              value={facilityNotes}
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
              登録
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

