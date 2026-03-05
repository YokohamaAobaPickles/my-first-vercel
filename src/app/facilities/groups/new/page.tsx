/**
 * Filename: src/app/facilities/groups/new/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-01 登録団体情報の登録。RegistrationGroup に基づくフォーム。
 */

'use client'

import React, {
  useState,
  ChangeEvent,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { createRegistrationGroup } from '@/utils/facilityHelpers'
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

export default function NewRegistrationGroupPage() {
  const router = useRouter()

  const [clubName, setClubName] = useState('')
  const [clubNumber, setClubNumber] = useState('')
  const [representativeId, setRepresentativeId] = useState('')
  const [viceRepresentativeId, setViceRepresentativeId] = useState('')
  const [notes, setNotes] = useState('')

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
    const payload = {
      registration_club_name: clubName,
      registration_club_number: toStr(clubNumber),
      representative_id: toStr(representativeId),
      vice_representative_id: toStr(viceRepresentativeId),
      registration_club_notes: toStr(notes),
    }

    const result = await createRegistrationGroup(payload)

    if (result) {
      router.push('/facilities/groups')
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
            登録団体登録
          </h1>
        </div>

        <div style={card}>
          <div style={memberPage.itemStack}>
            <label
              htmlFor="registration_club_name"
              style={memberPage.label}
            >
              団体名（必須）
            </label>
            <input
              id="registration_club_name"
              type="text"
              value={clubName}
              onChange={handleChangeClubName}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_club_number"
              style={memberPage.label}
            >
              団体番号
            </label>
            <input
              id="registration_club_number"
              type="text"
              value={clubNumber}
              onChange={handleChangeClubNumber}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="representative_id"
              style={memberPage.label}
            >
              代表者ID
            </label>
            <input
              id="representative_id"
              type="text"
              value={representativeId}
              onChange={handleChangeRepresentativeId}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="vice_representative_id"
              style={memberPage.label}
            >
              副代表者ID
            </label>
            <input
              id="vice_representative_id"
              type="text"
              value={viceRepresentativeId}
              onChange={handleChangeViceRepresentativeId}
              style={memberPage.value}
            />
          </div>

          <div style={itemStackStyle}>
            <label
              htmlFor="registration_club_notes"
              style={memberPage.label}
            >
              備考
            </label>
            <textarea
              id="registration_club_notes"
              value={notes}
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
              href="/facilities/groups"
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
