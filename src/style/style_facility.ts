/**
 * Filename: src/style/style_facility.ts
 * Version : V1.0.0
 * Update  : 2026-03-04
 * 修正内容：
 * V1.0.0 -施設関連のスタイル定義を追加。
*/

import { spacing, colors, font } from "@/style/style_common";

export const facilityPage = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;
