/**
 * Filename: src/style/style_common.ts
 * Version : V1.0.0
 * Update  : 2026-02-26
 * 修正内容：
 * V1.0.0 - 共通スタイル定義を追加。
*/

// ------------------------------
// Design Tokens
// ------------------------------
export const colors = {
  //background: "#194E5D",
  //background: '#0b242b', // ダークブルー1色の背景色
  // 背景をグラディエーションにするためには以下の定義を使う
  background: 'linear-gradient(to bottom, #11353f 0%, #000000 100%)',
  backgroundAttachment: 'fixed',
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
    lg: 20,
    xl: 24,
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
  // 主なアクションのボタン
  primary: {
    backgroundColor: colors.status.info,
    color: colors.text,
  },
  // 二次的なアクションのボタン
  secondary: {
    backgroundColor: "transparent",
    border: `1px solid ${colors.status.info}`,
    color: colors.status.info,
  },
  // キャンセルボタン
  cancel: {
    backgroundColor: colors.status.warning,
    color: colors.text,
  },
  // 無効な状態のボタン
  inactive: {
    backgroundColor: colors.status.inactive,
    color: colors.textSub,
  },
  // 検索ボタン
  search: {
    backgroundColor: colors.status.info,
    color: colors.text,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: font.size.sm,
  },
  // 管理者用ボタン
  admin: {
    backgroundColor: colors.status.active,
    color: colors.text,
    padding: "6px 12px",
    borderRadius: radius.button,
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
  },
  // 新規作成ボタン
  new: {
    backgroundColor: colors.status.active,
    color: colors.text,
    padding: "6px 16px",
    borderRadius: radius.button,
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
  },
  // 編集ボタン
  edit: {
    backgroundColor: colors.status.active,
    color: colors.text,
    padding: "6px 12px",
    borderRadius: radius.input,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
  },
  // 削除ボタン
  delete: {
    backgroundColor: colors.status.danger,
    color: colors.text,
    padding: "6px 12px",
    borderRadius: radius.input,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
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
// Breakpoints デバイス幅
// ------------------------------
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

// ------------------------------
// Container / Content
// ------------------------------
export const container = {
  width: "100%",
  minHeight: "100vh",
  boxSizing: 'border-box',
  display: "flex",
  flexDirection: "column",
  //backgroundColor: colors.background,
  // グラデーションを適用。backgroundAttachmentでスクロールしても背景を固定する
  background: colors.background,
  backgroundAttachment: 'fixed',
  border: `none`,
  padding: spacing.xs,
} as const;

/**
 * デバイス幅に応じたcontentスタイルを生成する関数
 * @param width ウィンドウ幅
 * @returns スタイルオブジェクト
 */
export const getContentStyle = (width: number) => {
  const base = {
    margin: "0 auto",
    paddingBottom: 80,
    width: "100%",
  };

  if (width < breakpoints.mobile) {
    return { ...base, maxWidth: "100%" };
  }

  if (width < breakpoints.tablet) {
    return { ...base, maxWidth: 600 };
  }

  return { ...base, maxWidth: 900 };
};

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
// Common Row Layouts
// ------------------------------
export const row = {
  filter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  // 行（見出しとボタンの並び）のベース
  header: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between', // 左右に振り分け
    alignItems: 'center',             // これが「上下中央」のキモ
    width: '100%',
    marginBottom: spacing.sm,
  },
  // 左側のグループ（見出し、検索ボタン、鍵アイコンなど）
  leftGroup: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',             // 子要素（テキストとボタン）を上下中央に
    gap: spacing.sm,                  // 要素間のスキマ
  },
} as const;

// ------------------------------
// Common Filter UI
// ------------------------------
export const filter = {
  box: {
    backgroundColor: colors.inputBackground,
    border: `1px solid ${colors.border}`,
    padding: "6px 12px",
    borderRadius: radius.input,
    color: colors.text,
    fontSize: font.size.sm,
  },
} as const;

// ------------------------------
// 共通ページヘッダー
// ------------------------------
export const pageHeader = {
  container: {
    ...row.filter, // 既存の左右振り分けロジックを継承
    marginBottom: spacing.lg, // タイトル下の余白を少し広めに
  },
  title: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
    margin: 0,
  }
} as const;

// ------------------------------
// 共通データ表示スタイル
// ------------------------------
export const dataDisplay = {
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.sm,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spacing.sm,
    textAlign: 'center' as const,
  },
  itemStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  label: {
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  // ...
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
