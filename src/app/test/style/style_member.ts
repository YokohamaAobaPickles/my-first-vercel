// test/style/style_member.ts
import { spacing, colors, font } from "./style_common";

export const memberPage = {
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },

  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  filterBox: {
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    padding: "6px 12px",
    borderRadius: 8,
    color: colors.text,
    fontSize: font.size.sm,
  },

  searchButton: {
    backgroundColor: colors.status.info,
    color: colors.text,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: font.size.sm,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;
