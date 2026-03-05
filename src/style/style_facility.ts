/**
 * Filename: src/app/facilities/style_facility.ts
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks: 
 * V1.0.1
 * 施設管理（F群）専用のスタイル定義。F群で使用する memberPage 相当を内包。
 * V1.0.0
 * Remarks: 施設管理（F群）専用のスタイル定義を分離。
 */

import {
  spacing,
  colors,
  font,
  radius,
} from '@/style/style_common';

/** ページ全体のコンテナ（max-width: 1200px 想定） */
//export const facilityPage = {
//  maxWidth: 1200,
//  width: '100%' as const,
//  marginLeft: 'auto' as const,
//  marginRight: 'auto' as const,
//  paddingLeft: spacing.md,
//  paddingRight: spacing.md,
//};

/** 一覧で使用するカード型スタイル */
export const facilityCard = {
  backgroundColor: colors.background,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.card,
  padding: spacing.lg,
  marginBottom: spacing.md,
};

/** 管理者用タブメニューを包むコンテナ */
export const adminTabContainer = {
  display: 'flex' as const,
  flexDirection: 'row' as const,
  gap: 0,
  borderBottom: `1px solid ${colors.border}`,
  marginBottom: spacing.lg,
};

/** 各タブの基本スタイル */
export const adminTab = {
  padding: `${spacing.sm} ${spacing.lg}`,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  color: colors.textSub,
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `2px solid transparent`,
  cursor: 'pointer' as const,
};

/** アクティブな（現在表示中の）タブの強調スタイル */
export const adminTabActive = {
  color: colors.text,
  fontWeight: font.weight.bold,
  borderBottom: `2px solid ${colors.status.info}`,
};

/**
 * F群で使用する list / itemStack / label / value / bodyText（style_member 相当）。
 * 施設フォルダ内で実際に使用されているプロパティのみ定義。
 */
export const facilityPage = {
  list: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  itemStack: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '2px',
  },
  label: {
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  value: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  bodyText: {
    fontSize: font.size.sm,
    color: colors.text,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'left' as const,
  },
} as const;

/** 登録・編集画面のフォームグループ（ラベル＋入力のまとまり） */
export const formGroup = {
  display: 'flex' as const,
  flexDirection: 'column' as const,
  gap: '2px',
  marginBottom: spacing.md,
};

/** フォーム用入力フィールドの基本スタイル */
export const input = {
  backgroundColor: colors.inputBackground,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.input,
  padding: spacing.sm,
  fontSize: font.size.sm,
  color: colors.text,
  minHeight: 40,
};

/** 登録・編集画面で使用するボタン用スタイル */
export const button = {
  base: {
    height: 40,
    borderRadius: radius.button,
    padding: '0 16px',
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    display: 'flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.status.info,
    color: colors.text,
  },
  secondary: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.status.info}`,
    color: colors.status.info,
  },
} as const;
