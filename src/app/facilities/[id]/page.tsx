/**
 * Filename: src/app/facilities/[id]/page.tsx
 * Version: V1.1.0
 * Update: 2026-03-05
 * Remarks: 拡張された施設スキーマに対応し、全項目を表示。
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getFacilityById } from '@/utils/facilityHelpers'
import type { Facility } from '@/types/facility'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

export default function FacilityDetailPage() {
  const params = useParams()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''

  const [facility, setFacility] = useState<Facility | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFacility = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      const data = await getFacilityById(id)
      setFacility(data ?? null)
      setIsLoading(false)
    }

    fetchFacility()
  }, [id])

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
            <h1 style={pageHeader.title}>施設詳細</h1>
          </div>
          <div style={memberPage.bodyText}>読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!facility) {
    return (
      <div style={container}>
        <div
          style={{
            padding: spacing.md,
            paddingBottom: 100,
          }}
        >
          <div style={pageHeader.container}>
            <h1 style={pageHeader.title}>施設詳細</h1>
          </div>
          <div style={memberPage.bodyText}>
            施設が見つかりません。
          </div>
          <div style={{ marginTop: spacing.lg }}>
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
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const mapHref =
    facility.map_url && facility.map_url.trim() !== ''
      ? facility.map_url
      : facility.address
        ? `https://www.google.com/maps?q=${encodeURIComponent(
            facility.address
          )}`
        : null

  const itemStackStyle = {
    ...memberPage.itemStack,
    marginTop: spacing.md,
  }

  const emptyStr = (v: string | null | undefined) =>
    (v != null && String(v).trim() !== '') ? String(v) : '-'
  const emptyNum = (v: number | null | undefined) =>
    (v != null && !Number.isNaN(v)) ? String(v) : '-'

  return (
    <div style={container}>
      <div
        style={{
          padding: spacing.md,
          paddingBottom: 100,
        }}
      >
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設詳細</h1>
        </div>

        <div style={card}>
          <div style={memberPage.itemStack}>
            <span style={memberPage.label}>施設名</span>
            <span style={memberPage.value}>
              {facility.facility_name || '-'}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>住所</span>
            <span style={memberPage.value}>
              {emptyStr(facility.address)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>地図URL</span>
            {mapHref ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                style={memberPage.value}
              >
                {facility.map_url || facility.address || '地図を開く'}
              </a>
            ) : (
              <span style={memberPage.value}>-</span>
            )}
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>電話番号</span>
            <span style={memberPage.value}>
              {emptyStr(facility.phone)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>メール</span>
            <span style={memberPage.value}>
              {emptyStr(facility.email)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>公式サイト</span>
            {facility.facility_url && facility.facility_url.trim() !== '' ? (
              <a
                href={facility.facility_url}
                target="_blank"
                rel="noopener noreferrer"
                style={memberPage.value}
              >
                {facility.facility_url}
              </a>
            ) : (
              <span style={memberPage.value}>-</span>
            )}
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>団体登録日</span>
            <span style={memberPage.value}>
              {emptyStr(facility.registration_date)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>更新期限</span>
            <span style={memberPage.value}>
              {emptyStr(facility.renewal_date)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>登録料</span>
            <span style={memberPage.value}>
              {emptyNum(facility.registration_fee)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>年会費</span>
            <span style={memberPage.value}>
              {emptyNum(facility.annual_fee)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>利用料金説明</span>
            <span style={memberPage.value}>
              {emptyStr(facility.facility_fee_desc)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>コート番号</span>
            <span style={memberPage.value}>
              {emptyStr(facility.court_numbers)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>抽選日説明</span>
            <span style={memberPage.value}>
              {emptyStr(facility.lottery_date_desc)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>駐車場台数</span>
            <span style={memberPage.value}>
              {emptyNum(facility.parking_capacity)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={memberPage.label}>備考</span>
            <div style={memberPage.bodyText}>
              {facility.facility_notes || '-'}
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
              href={`/facilities/edit/${id}`}
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
              一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
