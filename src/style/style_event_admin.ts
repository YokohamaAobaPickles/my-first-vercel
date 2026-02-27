/**
 * イベント管理者画面用スタイル（style_common 参照のみ・変更禁止）
 */
import { spacing, colors, font, card, radius } from "@/style/style_common";

// ------------------------------
// Admin Page Layout
// ------------------------------
export const adminPage = {
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
  newButtonWrap: {
    flexShrink: 0,
  },
  newLink: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.text,
    backgroundColor: colors.status.active,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    textDecoration: "none",
  },
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
  monthHeader: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.textSub,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
    marginTop: spacing.md,
  },
} as const;

// ------------------------------
// Admin Event Card
// ------------------------------
export const adminEventCard = {
  container: {
    ...card,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
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
    flexWrap: "wrap" as const,
    gap: spacing.xs,
  },
  badge: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: font.size.xs,
    borderRadius: radius.badge,
    fontWeight: font.weight.bold,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.sm,
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  info: {
    fontSize: font.size.sm,
    color: colors.textSub,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
  },
  editButton: {
    flexShrink: 0,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: font.size.xs,
    color: colors.text,
    backgroundColor: colors.status.info,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
    textDecoration: "none",
  },
} as const;

// ------------------------------
// Admin Filter Panel
// ------------------------------
export const adminFilterPanel = {
  triggerButton: {
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
    marginBottom: spacing.md,
  },
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 100,
  },
  panel: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    width: "min(320px, 100%)",
    height: "100%",
    backgroundColor: colors.inputBackground,
    borderLeft: `1px solid ${colors.border}`,
    padding: spacing.lg,
    overflowY: "auto" as const,
    zIndex: 101,
  },
  panelTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: colors.textSub,
    marginBottom: spacing.sm,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.xs,
  },
  chip: {
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontSize: font.size.xs,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.badge,
    cursor: "pointer",
  },
  chipSelected: {
    backgroundColor: colors.status.info,
    borderColor: colors.status.info,
  },
  closeButton: {
    marginTop: spacing.lg,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.info,
    border: "none",
    borderRadius: radius.input,
    cursor: "pointer",
    width: "100%",
  },
} as const;

// ------------------------------
// Admin Event Form（new / edit 共通）
// ------------------------------
export const adminEventForm = {
  backRow: {
    marginBottom: spacing.lg,
  },
  backButton: {
    fontSize: font.size.sm,
    color: colors.textSub,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textDecoration: "none",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.lg,
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: colors.text,
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
  select: {
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
  textarea: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    outline: "none",
    minHeight: 80,
    resize: "vertical" as const,
  },
  submitRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  submitButton: {
    width: "100%",
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    backgroundColor: colors.status.active,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  // 編集画面用のボタン行（キャンセル / 更新 / 削除）
  editButtonRow: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  editCancelButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.textSub,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  editUpdateButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.info,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  editDeleteButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.status.danger,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  // 削除確認モーダル
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 120,
  },
  modalContent: {
    position: "fixed" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 360,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.card,
    padding: spacing.lg,
    zIndex: 121,
  },
  modalTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  modalBody: {
    fontSize: font.size.sm,
    color: colors.textSub,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    display: "flex",
    flexDirection: "row" as const,
    gap: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: font.size.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    cursor: "pointer",
  },
  modalDeleteButton: {
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
