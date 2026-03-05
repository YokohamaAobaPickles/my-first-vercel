/**
 * Filename: src/app/facilities/page.tsx
 * Version: V1.1.0
 * Update: 2026-03-05
 * Remarks: 表示項目を施設名と電話番号に絞り、詳細リンクを追加。
 */

import Link from 'next/link';

import { getFacilities } from '@/utils/facilityHelpers';
import { Facility } from '@/types/facility';
import {
  container,
  card,
  spacing,
  button,
  pageHeader,
} from '@/style/style_common';
import { memberPage } from '@/style/style_member';

export default async function FacilitiesPage() {
  const facilities: Facility[] = await getFacilities();

  const hasNoFacilities = !facilities || facilities.length === 0;

  return (
    <div style={container}>
      <div
        style={{
          padding: spacing.md,
          paddingBottom: 100,
        }}
      >
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>施設管理</h1>
          <Link
            href="/facilities/new"
            style={button.new}
          >
            新規登録
          </Link>
        </div>

        {hasNoFacilities ? (
          <div style={memberPage.bodyText}>
            施設が登録されていません
          </div>
        ) : (
          <div style={memberPage.list}>
            {facilities.map((facility) => (
              <div
                key={facility.id}
                style={card}
              >
                <div style={memberPage.itemStack}>
                  <span style={memberPage.label}>施設名</span>
                  <Link
                    href={`/facilities/${facility.id}`}
                    style={memberPage.value}
                  >
                    {facility.facility_name}
                  </Link>
                </div>
                <div
                  style={{
                    ...memberPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={memberPage.label}>電話番号</span>
                  <span style={memberPage.value}>
                    {facility.phone?.trim() || '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
