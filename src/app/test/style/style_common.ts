// test/style/style_common.ts

// ------------------------------
// Design Tokens
// ------------------------------
export const colors = {
  background: "#194E5D",
  border: "#1E5E70",
  inputBackground: "#08191E",
  text: "#FFFFFF",
  textSub: "lightgray",

  status: {
    active: "#2A8F6A",     // 在籍 / 受付中 / 入金済
    pending: "#D98A3A",    // 休会申請中 / 承認待ち
    inactive: "#555555",   // 退会 / 終了 / 無効
    danger: "#C94A4A",     // 満員 / 故障 / 未入金
    warning: "#D9B63A",    // 下書き
    info: "#1E5E70",       // 公開
    unread: "#1E90FF",     // 未読
  },
} as const;

export const radius = {
  card: 12,
  input: 8,
  button: 20,
  badge: 10,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const font = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
  },
  weight: {
    normal: 400,
    medium: 500,
    bold: 600,
  },
} as const;

// ------------------------------
// Typography
// ------------------------------
export const text = {
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: colors.textSub,
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.text,
    textDecoration: "underline",
    cursor: "pointer",
  },
  linkSubtle: {
    color: colors.textSub,
    textDecoration: "underline",
    cursor: "pointer",
  },
} as const;

// ------------------------------
// Container / Content
// ------------------------------
export const container = {
  minHeight: "100vh",
  backgroundColor: colors.background,
  padding: spacing.lg,
} as const;

export const content = {
  maxWidth: 500,
  margin: "0 auto",
  paddingBottom: 80, // BottomNav 分
} as const;

// ------------------------------
// Card
// ------------------------------
export const card = {
  backgroundColor: colors.background,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.card,
  padding: spacing.lg,
} as const;

// ------------------------------
// CardInput
// ------------------------------
export const cardInput = {
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: font.size.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.input,
    padding: spacing.sm,
    height: 40,
    color: colors.text,
    fontSize: font.size.md,
  },
  textarea: {
    minHeight: 100,
  },
} as const;

// ------------------------------
// Button / ButtonGroup
// ------------------------------
export const button = {
  base: {
    height: 40,
    borderRadius: radius.button,
    padding: "0 16px",
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.status.info,
    color: colors.text,
  },
  secondary: {
    backgroundColor: "transparent",
    border: `1px solid ${colors.status.info}`,
    color: colors.status.info,
  },
  cancel: {
    backgroundColor: colors.status.danger,
    color: colors.text,
  },
  inactive: {
    backgroundColor: colors.status.inactive,
    color: colors.textSub,
  },
  search: { 
    backgroundColor: colors.status.info,
    color: colors.text, 
    padding: "6px 12px", 
    borderRadius: 8, 
    fontSize: font.size.sm, 
  },
} as const;

export const buttonGroup = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
} as const;

// ------------------------------
// Badge
// ------------------------------
export const badge = {
  base: {
    height: 20,
    borderRadius: radius.badge,
    padding: "0 8px",
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    display: "inline-flex",
    alignItems: "center",
    color: colors.text,
  },
  status: {
    active: { backgroundColor: colors.status.active },
    pending: { backgroundColor: colors.status.pending },
    inactive: { backgroundColor: colors.status.inactive },
    danger: { backgroundColor: colors.status.danger },
    warning: { backgroundColor: colors.status.warning },
    info: { backgroundColor: colors.status.info },
    unread: { backgroundColor: colors.status.unread },
  },
} as const;

// ------------------------------
// ListItemCardSimple
// ------------------------------
export const listItemSimple = {
  container: {
    ...card,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.text,
  },
  sub: {
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  right: {
    display: "flex",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
} as const;
