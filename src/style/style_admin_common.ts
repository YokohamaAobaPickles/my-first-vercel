/**
 * Filename: src/style/style_admin_common.ts
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks:
 * V1.0.0 - 管理者向け共通スタイルの初期実装。イベント管理で仮作成
 */

import { spacing, colors, font, radius } from "@/style/style_common";

export const adminCommon = {
  buttonRow: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.textSub,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  updateButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.info,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  deleteButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.danger,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
} as const;

