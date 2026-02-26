/**
 * Filename: src/V1/style/style_event.ts
 * Version : V0.1.0
 * Update  : 2026-02-11
 * Remarks : 
 * V0.1.0 - 初期バージョン
 */

import { spacing, colors, font, card } from "@v1/style/style_common";

// ------------------------------
// Event Page Layout
// ------------------------------
export const eventPage = {
  monthHeader: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.textSub,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;

// ------------------------------
// Event List Item Card
// ------------------------------
export const listItemEvent = {
  container: {
    ...card,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  badges: {
    display: "flex",
    gap: spacing.xs,
  },
  info: {
    fontSize: font.size.sm,
    color: colors.textSub,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  participants: {
    display: "flex",
    gap: spacing.xs,
    fontSize: font.size.sm,
    color: colors.text,
  },
} as const;
