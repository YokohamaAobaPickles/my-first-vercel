/**
 * Filename: src/app/facilities/(admin)/groups/page.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-04 登録団体一覧。getRegistrationGroups で取得しカード表示。
 */

'use client'

import React, {
  useState,
  useEffect,
} from 'react'
import Link from 'next/link'

import { getRegistrationGroups } from '@/utils/facilityHelpers'
import type { RegistrationGroup } from '@/types/facility'
import {
  container,
  card,
  spacing,
  pageHeader,
} from '@/style/style_common'
import { facilityPage } from '@/style/style_facility'

export default function GroupsPage() {
  const [groups, setGroups] = useState<RegistrationGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      const list = await getRegistrationGroups()
      setGroups(list ?? [])
      setIsLoading(false)
    }

    fetchGroups()
  }, [])

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
              登録団体一覧
            </h1>
          </div>
          <div style={facilityPage.bodyText}>
            読み込み中...
          </div>
        </div>
      </div>
    )
  }

  const hasNoGroups = !groups || groups.length === 0

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
            登録団体一覧
          </h1>
        </div>

        <div
          style={{
            marginBottom: spacing.md,
          }}
        >
          <Link
            href="/facilities"
            style={facilityPage.value}
          >
            施設一覧へ戻る
          </Link>
        </div>

        {hasNoGroups ? (
          <div style={facilityPage.bodyText}>
            登録団体がありません
          </div>
        ) : (
          <div style={facilityPage.list}>
            {groups.map((group) => (
              <div
                key={group.id}
                style={card}
              >
                <div style={facilityPage.itemStack}>
                  <span style={facilityPage.label}>
                    団体名
                  </span>
                  <Link
                    href={`/facilities/groups/${group.id}`}
                    style={facilityPage.value}
                  >
                    {group.registration_club_name}
                  </Link>
                </div>
                <div
                  style={{
                    ...facilityPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={facilityPage.label}>
                    団体番号
                  </span>
                  <span style={facilityPage.value}>
                    {group.registration_club_number ?? '-'}
                  </span>
                </div>
                <div
                  style={{
                    ...facilityPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={facilityPage.label}>
                    代表者ID
                  </span>
                  <span style={facilityPage.value}>
                    {group.representative_id ?? '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
