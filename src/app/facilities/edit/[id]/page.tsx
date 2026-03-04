/**
 * Filename: src/app/facilities/edit/[id]/page.tsx
 * Version: V1.0.2
 * Update: 2026-03-05
 * Remarks: getFacilityByIdの実装、命名整理、および
 *          スタイル適用エラーの修正。
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
import { memberPage } from '@/style/style_member'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFacility = async () => {
      if (!facilityId) return

      const data = await getFacilityById(facilityId)

      if (!data) return

      setFacilityName(data.facility_name || '')
      setAddress(data.address || '')
      setMapUrl(data.map_url || '')
      setFacilityNotes(data.facility_notes || '')
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

  const handleUpdate = async () => {
    if (!facilityId) return

    const payload = {
      facility_name: facilityName,
      address,
      map_url: mapUrl,
      facility_notes: facilityNotes,
    }

    const result = await updateFacility(
      facilityId,
      payload,
    )

    if (result) {
      router.push('/facilities')
    }
  }

  const handleDelete = async () => {
    if (!facilityId) return

    const ok = window.confirm(
      'この施設を削除しますか？',
    )

    if (!ok) return

    const result = await deleteFacility(
      facilityId,
    )

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

