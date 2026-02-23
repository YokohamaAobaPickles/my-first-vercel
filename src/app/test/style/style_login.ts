import { spacing, colors, font } from "./style_common";

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
