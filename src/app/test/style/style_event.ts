// test/style/style_event.ts
import { spacing, colors, font } from "./style_common";

export const eventPage = {
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },

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
