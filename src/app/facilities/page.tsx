/**
 * Filename: src/app/facilities/page.tsx
 * Version : V1.0.0
 * Update  : 2026-03-04
 * Remarks : 施設一覧画面 (F-14)
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
  row,
} from '@/style/style_common';
import { memberPage } from '@/style/style_member';

const createMapUrl = (facility: Facility): string => {
  if (facility.map_url && facility.map_url.trim() !== '') {
    return facility.map_url;
  }

  const query = facility.address || facility.facility_name;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
};

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
                <div style={row.header}>
                  <div style={row.leftGroup}>
                    <span style={memberPage.sectionTitle}>
                      {facility.facility_name}
                    </span>
                  </div>
                  <Link
                    href={`/facilities/edit/${facility.id}`}
                    style={button.edit}
                  >
                    編集
                  </Link>
                </div>

                <div style={memberPage.itemStack}>
                  <span style={memberPage.label}>住所</span>
                  {facility.address ? (
                    <a
                      href={createMapUrl(facility)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={memberPage.value}
                    >
                      {facility.address}
                    </a>
                  ) : (
                    <span style={memberPage.value}>
                      住所は登録されていません。
                    </span>
                  )}
                </div>

                <div
                  style={{
                    ...memberPage.itemStack,
                    marginTop: spacing.sm,
                  }}
                >
                  <span style={memberPage.label}>備考</span>
                  <div style={memberPage.bodyText}>
                    {facility.facility_notes ||
                      '備考は登録されていません。'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

