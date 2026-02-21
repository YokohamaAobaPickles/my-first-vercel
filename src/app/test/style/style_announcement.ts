// test/style/style_announcement.ts
import { spacing, colors, font } from "./style_common";

export const announcementPage = {
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  newButton: {
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
