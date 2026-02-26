/**
 * Filename: src/app/V1/member/profile/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-26
 * Remarks :
 * V1.0.0 - プロフィール表示画面。会員情報カード・基本情報カード・下部ナビ。
 */

'use client'

import Link from 'next/link'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'
import { canManageMembers } from '@v1/utils/auth'
import {
  colors,
  container,
  card,
  text,
  spacing,
  font,
  button,
  row,
} from '@v1/style/style_common'
import { memberPage } from '@v1/style/style_member'
import { bottomNav } from '@v1/style/style_bottomnav'
import {
  MEMBER_STATUS_LABELS,
  MEMBER_KIND_LABELS,
  ROLES_LABELS,
  type MemberStatus,
} from '@v1/types/member'

function fallback(v: string | number | null | undefined): string {
  if (v === null || v === undefined || String(v).trim() === '') return '-'
  return String(v)
}

function formatDate(s: string | null | undefined): string {
  if (!s) return '-'
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(s).trim())) return String(s).trim()
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return fallback(s)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function ProfilePage() {
  const { user, isLoading, userRoles } = useAuthCheck()

  if (isLoading) {
    return (
      <div
        style={{
          ...container,
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
          fontSize: font.size.md,
        }}
      >
        読み込み中...
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          ...container,
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
          fontSize: font.size.md,
        }}
      >
        ユーザー情報が見つかりません。
      </div>
    )
  }

  const statusLabel = MEMBER_STATUS_LABELS[user.status as MemberStatus] ?? user.status
  const kindLabel = MEMBER_KIND_LABELS[user.member_kind] ?? user.member_kind ?? '-'
  const roleLabels = (user.roles ?? [])
    .map((r) => ROLES_LABELS[r] || r)
    .filter(Boolean)
    .join(', ') || '-'
  const statusColor =
    user.status === 'active'
      ? colors.status.active
      : user.status === 'withdrawn' || user.status === 'rejected'
        ? colors.status.inactive
        : colors.status.pending

  const infoRowLabel = { fontSize: font.size.sm, color: colors.textSub, marginBottom: spacing.xs }
  const infoRowValue = { fontSize: font.size.sm, color: colors.text, fontWeight: font.weight.normal }

  return (
    <div
      style={{
        ...container,
        paddingBottom: 80,
      }}
    >
      <div style={memberPage.list}>
        {/* 1. 会員情報カード */}
        <div style={card}>
          <div style={{ ...row.filter, marginBottom: spacing.lg }}>
            <h2 style={{ ...text.title, marginBottom: 0 }}>会員情報</h2>
            <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
              <Link
                href="/V1/member/search"
                style={{ ...button.base, ...button.search, textDecoration: 'none' }}
              >
                検索
              </Link>
              {canManageMembers(userRoles) && (
                <Link
                  href="/V1/member/admin"
                  style={{ ...button.base, ...button.secondary, textDecoration: 'none' }}
                >
                  管理
                </Link>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: spacing.md, gap: spacing.sm }}>
            <div>
              <div style={infoRowLabel}>会員番号</div>
              <div style={infoRowValue}>{fallback(user.member_number)}</div>
            </div>
            <div>
              <div style={infoRowLabel}>会員種別</div>
              <div style={infoRowValue}>{kindLabel}</div>
            </div>
            <div>
              <div style={infoRowLabel}>ステータス</div>
              <div style={{ ...infoRowValue, color: statusColor }}>{statusLabel}</div>
            </div>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <div style={infoRowLabel}>ニックネーム</div>
            <div style={infoRowValue}>{fallback(user.nickname)}</div>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <div style={infoRowLabel}>役割</div>
            <div style={infoRowValue}>{roleLabels}</div>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <div style={infoRowLabel}>プロフィール</div>
            <div style={{ ...infoRowValue, whiteSpace: 'pre-wrap' }}>{fallback(user.profile_memo)}</div>
          </div>
          <div style={infoRowLabel}>DUPR</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm }}>
            <div>
              <div style={infoRowLabel}>ダブルス</div>
              <div style={infoRowValue}>
                {user.dupr_rate_doubles != null ? Number(user.dupr_rate_doubles).toFixed(3) : '-'}
              </div>
            </div>
            <div>
              <div style={infoRowLabel}>シングルス</div>
              <div style={infoRowValue}>
                {user.dupr_rate_singles != null ? Number(user.dupr_rate_singles).toFixed(3) : '-'}
              </div>
            </div>
            <div>
              <div style={infoRowLabel}>記録日</div>
              <div style={infoRowValue}>{formatDate(user.dupr_rate_date ?? undefined)}</div>
            </div>
          </div>
        </div>

        {/* 2. 基本情報カード */}
        <div style={card}>
          <div style={{ ...row.filter, marginBottom: spacing.lg }}>
            <h2 style={{ ...text.title, marginBottom: 0 }}>
              基本情報
              {user.is_profile_public === false && (
                <span style={{ marginLeft: spacing.sm }}>(非公開) 🔒</span>
              )}
            </h2>
            <Link
              href="/V1/member/edit"
              style={{ ...button.base, ...button.edit, textDecoration: 'none' }}
            >
              編集
            </Link>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <div style={infoRowLabel}>メールアドレス</div>
            <div style={infoRowValue}>{fallback(user.email)}</div>
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <div style={infoRowLabel}>氏名</div>
            <div style={infoRowValue}>{fallback(user.name)} {user.name_roma ? `(${user.name_roma})` : ''}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            <div>
              <div style={infoRowLabel}>性別</div>
              <div style={infoRowValue}>{fallback(user.gender)}</div>
            </div>
            <div>
              <div style={infoRowLabel}>生年月日</div>
              <div style={infoRowValue}>{formatDate(user.birthday ?? undefined)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            <div>
              <div style={infoRowLabel}>郵便</div>
              <div style={infoRowValue}>{fallback(user.postal)}</div>
            </div>
            <div>
              <div style={infoRowLabel}>電話番号</div>
              <div style={infoRowValue}>{fallback(user.tel)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            <div>
              <div style={infoRowLabel}>緊急連絡先電話</div>
              <div style={infoRowValue}>{fallback(user.emg_tel)}</div>
            </div>
            <div>
              <div style={infoRowLabel}>緊急連絡先</div>
              <div style={infoRowValue}>{fallback(user.emg_rel)}</div>
            </div>
          </div>
          <div>
            <div style={infoRowLabel}>緊急連絡メモ</div>
            <div style={{ ...infoRowValue, whiteSpace: 'pre-wrap' }}>{fallback(user.emg_memo)}</div>
          </div>
        </div>
      </div>

      <nav style={bottomNav.container} aria-label="メインナビゲーション">
        <Link href="/V1/announcements" style={bottomNav.item}>お知らせ</Link>
        <Link href="/V1/events" style={bottomNav.item}>イベント</Link>
        <Link href="/V1/accounting" style={bottomNav.item}>会計</Link>
        <Link href="/V1/member/profile" style={{ ...bottomNav.item, ...bottomNav.itemActive }}>会員</Link>
      </nav>
    </div>
  )
}
