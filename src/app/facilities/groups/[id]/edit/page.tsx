/**
 * Filename: src/app/facilities/groups/[id]/edit/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-02 登録団体情報の更新。getRegistrationGroupById で取得し updateRegistrationGroupInfo で保存。
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
  getRegistrationGroupById,
  updateRegistrationGroupInfo,
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

export default function EditRegistrationGroupPage() {
  const router = useRouter()
  const params = useParams()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  const [clubName, setClubName] = useState('')
  const [clubNumber, setClubNumber] = useState('')
  const [representativeId, setRepresentativeId] = useState('')
  const [viceRepresentativeId, setViceRepresentativeId] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      const data = await getRegistrationGroupById(id)

      if (!data) {
        setIsLoading(false)
        return
      }

      setClubName(data.registration_club_name ?? '')
      setClubNumber(data.registration_club_number ?? '')
      setRepresentativeId(data.representative_id ?? '')
      setViceRepresentativeId(data.vice_representative_id ?? '')
      setNotes(data.registration_club_notes ?? '')
      setIsLoading(false)
    }

    fetchGroup()
  }, [id])

  const handleChangeClubName = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setClubName(e.target.value)
  }

  const handleChangeClubNumber = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setClubNumber(e.target.value)
  }

  const handleChangeRepresentativeId = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setRepresentativeId(e.target.value)
  }

  const handleChangeViceRepresentativeId = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    setViceRepresentativeId(e.target.value)
  }

  const handleChangeNotes = (
    e: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setNotes(e.target.value)
  }

  const handleSubmit = async () => {
    if (!id) return

    const payload = {
      registration_club_name: clubName,
      registration_club_number: toStr(clubNumber),
      representative_id: toStr(representativeId),
      vice_representative_id: toStr(viceRepresentativeId),
      registration_club_notes: toStr(notes),
    }

    const result = await updateRegistrationGroupInfo(id, payload)

    if (result) {
      router.push(`/facilities/groups/${id}`)
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
              登録団体編集
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
            登録団体編集
          </h1>
        </div>

        <div style={card}>
          <div style={facilityPage.itemStack}>
            <label
              htmlFor="registration_club_name"
              style={facilityPage.label}
            >
              団体名（必須）
            </label>
            <input
              id="registration_club_name"
              type="text"
              value={clubName}
              onChange={handleChangeClubName}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_club_number"
              style={facilityPage.label}
            >
              団体番号
            </label>
            <input
              id="registration_club_number"
              type="text"
              value={clubNumber}
              onChange={handleChangeClubNumber}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="representative_id"
              style={facilityPage.label}
            >
              代表者ID
            </label>
            <input
              id="representative_id"
              type="text"
              value={representativeId}
              onChange={handleChangeRepresentativeId}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="vice_representative_id"
              style={facilityPage.label}
            >
              副代表者ID
            </label>
            <input
              id="vice_representative_id"
              type="text"
              value={viceRepresentativeId}
              onChange={handleChangeViceRepresentativeId}
              style={facilityPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_club_notes"
              style={facilityPage.label}
            >
              備考
            </label>
            <textarea
              id="registration_club_notes"
              value={notes}
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
              href={`/facilities/groups/${id}`}
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
