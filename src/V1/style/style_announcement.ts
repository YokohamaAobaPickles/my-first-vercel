/**
 * Filename: src/V1/style/style_announcement.ts
 * Version : V0.1.0
 * Update  : 2026-02-11
 * Remarks : 
 * V0.1.0 - 初期バージョン
 */

import { spacing, colors, font } from "@v1/style/style_common";

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
