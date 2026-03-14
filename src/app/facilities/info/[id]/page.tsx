/**
 * Filename: src/app/facilities/info/[id]/page.tsx
 * Version: V1.2.0
 * Update: 2026-03-05
 * Remarks:
 * V1.2.0 - 権限制御と管理画面への編集リンクを追加。
 * V1.1.1 - URLパラメータが 'admin' の場合はAPIを叩かず、
 *          何も描画しないよう修正。
 * V1.1.0 - 拡張された施設スキーマに対応し、全項目を表示。
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getFacilityById } from '@/utils/facilityHelpers'
import type { Facility } from '@/types/facility'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageFacilities } from '@/utils/auth'
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

export default function FacilityDetailPage() {
  const params = useParams()

  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ''
  // URLが /facilities/admin の場合、Next.jsの誤認識なので
  // 以下の処理（APIフェッチ）をすべてスキップする
  if (id === 'admin') {
    return null
  }

  const {
    userRoles,
    isLoading: authLoading,
  } = useAuthCheck()

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
          <div style={facilityPage.bodyText}>読み込み中...</div>
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
          <div style={facilityPage.bodyText}>
            施設が見つかりません。
          </div>
          <div style={{ marginTop: spacing.lg }}>
            <Link
              href="/facilities/info"
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
    ...facilityPage.itemStack,
    marginTop: spacing.md,
  }

  const emptyStr = (v: string | null | undefined) =>
    (v != null && String(v).trim() !== '') ? String(v) : '-'
  const emptyNum = (v: number | null | undefined) =>
    (v != null && !Number.isNaN(v)) ? String(v) : '-'

  const hasManageAuth =
    !authLoading &&
    canManageFacilities(userRoles)

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
          <div style={facilityPage.itemStack}>
            <span style={facilityPage.label}>施設名</span>
            <span style={facilityPage.value}>
              {facility.facility_name || '-'}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>住所</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.address)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>地図URL</span>
            {mapHref ? (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                style={facilityPage.value}
              >
                {facility.map_url || facility.address || '地図を開く'}
              </a>
            ) : (
              <span style={facilityPage.value}>-</span>
            )}
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>電話番号</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.phone)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>メール</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.email)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>公式サイト</span>
            {facility.facility_url && facility.facility_url.trim() !== '' ? (
              <a
                href={facility.facility_url}
                target="_blank"
                rel="noopener noreferrer"
                style={facilityPage.value}
              >
                {facility.facility_url}
              </a>
            ) : (
              <span style={facilityPage.value}>-</span>
            )}
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>団体登録日</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.registration_date)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>更新期限</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.renewal_date)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>登録料</span>
            <span style={facilityPage.value}>
              {emptyNum(facility.registration_fee)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>年会費</span>
            <span style={facilityPage.value}>
              {emptyNum(facility.annual_fee)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>利用料金説明</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.facility_fee_desc)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>コート番号</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.court_numbers)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>抽選日説明</span>
            <span style={facilityPage.value}>
              {emptyStr(facility.lottery_date_desc)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>駐車場台数</span>
            <span style={facilityPage.value}>
              {emptyNum(facility.parking_capacity)}
            </span>
          </div>

          <div style={itemStackStyle}>
            <span style={facilityPage.label}>備考</span>
            <div style={facilityPage.bodyText}>
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
            {hasManageAuth && (
              <Link
                href={`/facilities/info/edit/${id}`}
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
            )}
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
