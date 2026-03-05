/**
 * Filename: src/app/facilities/(admin)/groups/[id]/page.tsx
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks: F-05 登録団体詳細参照。F-03 登録団体情報の削除機能を追加。
 */

'use client'

import React, {
  useState,
  useEffect,
} from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import {
  getRegistrationGroupById,
  removeRegistrationGroup,
} from '@/utils/facilityHelpers'
import type { RegistrationGroup } from '@/types/facility'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

function emptyStr(
  v: string | null | undefined,
): string {
  return v != null && String(v).trim() !== ''
    ? String(v)
    : '-'
}

export default function RegistrationGroupDetailPage() {
  const params = useParams()
  const router = useRouter()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  const [group, setGroup] = useState<RegistrationGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      const data = await getRegistrationGroupById(id)
      setGroup(data ?? null)
      setIsLoading(false)
    }

    fetchGroup()
  }, [id])

  const handleDelete = async () => {
    if (!id) return

    const ok = window.confirm(
      'この団体を削除してもよろしいですか？',
    )

    if (!ok) return

    const result = await removeRegistrationGroup(id)

    if (result) {
      router.push('/facilities/groups')
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
              登録団体詳細
            </h1>
          </div>
          <div style={facilityPage.bodyText}>
            読み込み中...
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
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
              登録団体詳細
            </h1>
          </div>
          <div style={facilityPage.bodyText}>
            団体が見つかりません。
          </div>
          <div style={{ marginTop: spacing.lg }}>
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
              一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const itemStackStyle = {
    ...facilityPage.itemStack,
    marginTop: spacing.md,
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
            登録団体詳細
          </h1>
        </div>

        <div style={card}>
          <div style={facilityPage.itemStack}>
            <span style={facilityPage.label}>
              団体名
            </span>
            <span style={facilityPage.value}>
              {emptyStr(group.registration_club_name)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>
              団体番号
            </span>
            <span style={facilityPage.value}>
              {emptyStr(group.registration_club_number)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>
              代表者ID
            </span>
            <span style={facilityPage.value}>
              {emptyStr(group.representative_id)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>
              副代表者ID
            </span>
            <span style={facilityPage.value}>
              {emptyStr(group.vice_representative_id)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>
              備考
            </span>
            <div style={facilityPage.bodyText}>
              {emptyStr(group.registration_club_notes)}
            </div>
          </div>

          <div
            style={{
              marginTop: spacing.lg,
              display: 'flex',
              gap: spacing.sm,
              justifyContent: 'flex-end',
            }}
          >
            <Link
              href={`/facilities/groups/${id}/edit`}
              style={{
                ...button.base,
                ...button.primary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              編集する
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                ...button.base,
                ...button.delete,
              }}
            >
              削除する
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
              一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
