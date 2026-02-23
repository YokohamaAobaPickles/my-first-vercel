// test/style/style_member.ts
import { spacing, colors, font } from "./style_common";

export const memberPage = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;
