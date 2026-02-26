/**
 * Filename: src/style/style_member.ts
 * Version : V1.0.0
 * Update  : 2026-02-26
 * 修正内容：
 * V1.0.0 - 会員関連のスタイル定義を追加。
*/

import { spacing, colors, font } from "@/style/style_common";

export const memberPage = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  // セクションタイトル
  sectionTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    borderLeft: `4px solid ${colors.border}`, // 左側に細い線を入れる等のアクセント
    paddingLeft: spacing.sm,
  },
  // 追加：ラベルと値のセット用スタイル
  itemStack: {
    display: 'flex',
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
  // 1カラム（横いっぱい）の表示スタイル
  infoBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.xs,
    padding: `${spacing.md} 0`,
  },
  // 2列グリッドレイアウトのスタイル
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.sm,
  },
  // 3列グリッドレイアウトのスタイル
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spacing.sm,
    //textAlign: 'center' as const,
  },
  // 本文（プロフィール文など）のテキストスタイル
  bodyText: {
    fontSize: font.size.sm,
    color: colors.text,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'left' as const,
  },
  // カード内の区切り線がある行のベース
  rowBorder: {
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: spacing.md,
    marginBottom: spacing.md, // 行間の余白を一括設定
  },  
  // 最後の行（区切り線なし）
  rowLast: {
    paddingTop: spacing.xs,
  },

  // 非公開ラベル用
  privateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: font.size.xs,
    color: colors.textSub,
  }

} as const;
