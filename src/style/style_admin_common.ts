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
  // --- モーダル用スタイル追加 ---
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderRadius: radius.card,
    width: "90%",
    maxWidth: "400px",
    zIndex: 1001,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  modalTitle: {
    fontSize: font.size.lg,
    fontWeight: "bold" as const,
    marginBottom: spacing.md,
    color: colors.text,
  },
  modalBody: {
    fontSize: font.size.md,
    marginBottom: spacing.xl,
    color: colors.text,
    lineHeight: 1.5,
  },
  modalButtons: {
    display: "flex",
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.input,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.inputBackground,
    cursor: "pointer",
  },
  modalDeleteButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.input,
    border: "none",
    backgroundColor: colors.status.danger,
    color: colors.text,
    cursor: "pointer",
  },
} as const;

