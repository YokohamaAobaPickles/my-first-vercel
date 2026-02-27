/**
 * Filename: src/style/style_event.ts
 * Version : V1.0.0
 * Update  : 2026-02-26
 * 修正内容：
 * V1.0.0 - イベント関連のスタイル定義を追加。
*/

import { spacing, colors, font, card, radius } from "@/style/style_common";

// ------------------------------
// Event Page Layout
// ------------------------------
export const eventPage = {
  /** タイトル＋管理ボタン行（右上固定） */
  headerRow: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    width: "100%",
  },
  headerTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
    margin: 0,
  },
  adminButtonWrap: {
    flexShrink: 0,
  },
  adminLink: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.info,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    textDecoration: "none",
  },
  /** 未来／過去タブ */
  tabs: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.textSub,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  tabActive: {
    fontWeight: font.weight.bold,
    color: colors.text,
    backgroundColor: colors.status.info,
    borderColor: colors.status.info,
  },
  /** 過去タブ用フィルタ行 */
  pastFilterRow: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.sm,
    overflowX: "auto" as const,
    padding: `${spacing.xs}px 0`,
    marginBottom: spacing.md,
    WebkitOverflowScrolling: "touch",
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
  /** 定員・費用・駐車場の横並び行 */
  metaRow: {
    display: "flex",
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  metaItem: {
    display: "inline",
  },
} as const;

// ------------------------------
// Status Badge (detail / list)
// ------------------------------
export const statusBadge = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: radius.badge,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  受付中: { backgroundColor: "#1E90FF", color: colors.text },
  受付終了: { backgroundColor: "#555555", color: colors.text },
  抽選前: { backgroundColor: "#D98A3A", color: colors.text },
  抽選済み: { backgroundColor: "#6A5ACD", color: colors.text },
  参加確定: { backgroundColor: "#2A8F6A", color: colors.text },
  キャンセル待ち: { backgroundColor: "#555555", color: colors.text },
  満員: { backgroundColor: "#C94A4A", color: colors.text },
  終了: { backgroundColor: "#222", color: colors.text },
} as const;

/** アイコンサイズ調整用 */
export const icon = {
  small: { fontSize: font.size.sm },
  medium: { fontSize: font.size.md },
} as const;

// ------------------------------
// Search Bar
// ------------------------------
export const searchBar = {
  container: {
    marginBottom: spacing.md,
  },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    outline: "none",
  },
} as const;

// ------------------------------
// Filter Chips (横スクロール)
// ------------------------------
export const filterChips = {
  row: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.sm,
    overflowX: "auto" as const,
    padding: `${spacing.xs}px 0`,
    marginBottom: spacing.md,
    WebkitOverflowScrolling: "touch",
  },
  chip: {
    flexShrink: 0,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: font.size.xs,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.badge,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  chipSelected: {
    backgroundColor: colors.status.info,
    borderColor: colors.status.info,
    color: colors.text,
  },
} as const;

// ------------------------------
// Event Apply Page
// ------------------------------
export const eventApply = {
  section: {
    ...card,
    marginTop: spacing.md,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
  },
  row: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
  },
  label: {
    fontSize: font.size.sm,
    color: colors.textSub,
  },
  value: {
    fontSize: font.size.md,
    color: colors.text,
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    fontSize: font.size.sm,
    color: colors.text,
  },
  note: {
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    outline: "none",
  },
} as const;

// ------------------------------
// Simple Calendar (no library)
// ------------------------------
export const calendar = {
  wrap: {
    marginBottom: spacing.lg,
  },
  monthNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    fontSize: font.size.sm,
    color: colors.text,
  },
  monthNavButton: {
    background: "none",
    border: "none",
    color: colors.text,
    fontSize: font.size.sm,
    cursor: "pointer",
    padding: spacing.xs,
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
    marginBottom: spacing.xs,
  },
  weekDay: {
    fontSize: font.size.xs,
    color: colors.textSub,
    textAlign: "center" as const,
  },
  dayGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
  },
  dayCell: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: font.size.xs,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
  },
  dayCellEmpty: {
    backgroundColor: "transparent",
    border: "none",
  },
  dayCellHasEvent: {
    fontWeight: font.weight.bold,
    position: "relative" as const,
  },
  dayCellDot: {
    position: "absolute" as const,
    bottom: 2,
    left: "50%",
    transform: "translateX(-50%)",
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: colors.status.info,
  },
  dayCellSelected: {
    borderColor: colors.status.info,
    backgroundColor: colors.status.info,
  },
} as const;

// ------------------------------
// Event Detail Page
// ------------------------------
export const eventDetail = {
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    fontSize: font.size.sm,
    color: colors.textSub,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  card: {
    ...card,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  title: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  /** タイトルと状態バッジの行（タイトル下にバッジ横並び） */
  titleRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
  },
  statusBadges: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.xs,
    alignItems: "center",
  },
  dateRow: {
    fontSize: font.size.sm,
    color: colors.textSub,
  },
  body: {
    fontSize: font.size.md,
    color: colors.text,
    whiteSpace: "pre-wrap" as const,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
    fontSize: font.size.sm,
    color: colors.textSub,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
  },
} as const;
