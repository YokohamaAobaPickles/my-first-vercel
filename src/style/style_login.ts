/**
 * Filename: src/style/style_login.ts
 * Version : V1.0.0
 * Update  : 2026-02-26
 * 修正内容：
 * V1.0.0 - ログイン関連のスタイル定義を追加。
*/

import { spacing, colors, font } from "@/style/style_common";

export const loginPage = {
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  card: {
    display: "flex",
    flexDirection: "column",
    border: `none`,
    gap: spacing.md,
  },

  forgot: {
    fontSize: font.size.xs,
    color: colors.textSub,
    textAlign: "right",
    marginTop: spacing.sm,
  },
} as const;
