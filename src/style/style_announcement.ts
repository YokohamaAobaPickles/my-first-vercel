/**
 * Filename: src/style/style_announcement.ts
 * Version : V1.0.0
 * Update  : 2026-02-26
 * 修正内容：
 * V1.0.0 - お知らせ関連のスタイル定義を追加。
*/

import { spacing, colors, font } from "@/style/style_common";

export const announcementPage = {
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;
