これまでの対話と、ご提示いただいた画像・ドキュメントの内容を統合し、**「横浜青葉ピックルズ」の最新デザイン仕様書**を策定しました。

今後の開発における視覚的・構造的な「北極星」として活用します。

---

# 🎨 デザインシステム V2.0.0 — 今日のまとめ
## 🏠 1. Container / Content / Card の最終定義
### ✔ Container（敷地）
画面全体の背景・高さ（min-height: 100vh）・中央寄せを担当
全ページ共通（ログイン画面も含む）
BottomNav がない画面は paddingBottom を上書きするだけ
レスポンシブは Container ではなく Content で制御

### ✔ Content（本文の枠）
Container の中にある本文領域
maxWidth と padding を端末ごとに切り替える
スマホ：maxWidth 500px
タブレット：maxWidth 800px
PC：maxWidth 1200px
全ページ共通

### ✔ Card（情報のまとまり）
Content の中に置く情報ブロック
背景色：#194E5D
枠線：1px solid #1E5E70
角丸：12px
padding：16px
大きなまとまり（セクション）にも、小さなまとまり（入力欄など）にも使える
Card の中に別の Card を入れて OK（再利用性が高い）

# 🧩 2. 入力系コンポーネント（CardInput）
### ✔ CardInput は 1種類で統一
text / email / number
textarea（複数行）
select（ドロップダウン）
date（日付選択）
→ type と props で切り替えるだけ

### ✔ InputWrapper のデザイン
背景色：#08191E
枠線：1px solid #2A6F82
角丸：8px
padding：8px
高さ：
1行：40px
select：40px
date：40px
textarea：rows に応じて可変

# 🎛️ 3. ボタン（Button）とボタン群（CardButtonGroup）
### ✔ ボタンの形は pill 型 1種類に統一
height：40px
border-radius：20px
padding：0 16px
font-size：16px
font-weight：600

### ✔ 種類は「色」で切り替える
primary（最重要）
secondary（通常）
proceed（肯定）
cancel（否定）
inactive（無効）

### ✔ CardButtonGroup
ボタンをまとめる小さな Card
gap：12px
基本は縦並び（スマホ）
PC では横並びも可能

# 🏷️ 4. バッジ（Badge）
### ✔ Badge = 状態・種別・重要度を示す小さなラベル
形：pill 型
高さ：20px
padding：4px 8px
角丸：10px
font-size：12px
色で意味を表現（重要・公開・在籍・退会・会長など）

### ✔ 使用例
会員一覧：在籍 / 退会 / 会長
お知らせ一覧：重要 / 公開 / 無効 / 下書き
イベント一覧：受付中 / 満員 / 終了（将来）

# 📋 5. 一覧カード（ListItemCard）
### ✔ ListItemCardBase（共通）
背景色：#194E5D
枠線：1px solid #1E5E70
角丸：12px
padding：12px
タップ可能

### ✔ ListItemCardSimple（会員・お知らせ）
左：主要情報
右：バッジ
高さは内容に応じて可変
会員一覧・お知らせ一覧に使用

### ✔ ListItemCardEvent（イベント）
日付を大きく表示
時間・場所・参加人数など複数行
アイコンを含む
イベント一覧専用の構造

# 🌱 6. 今後の方針
### ✔ 今決めるべきもの
共通コンポーネント（CardInput / Button / Badge / ListItemCard）
デザインシステムの基礎レイヤー

### ✔ 後で決めていいもの
D群（会計管理）の画面構造
E群（資産/設備管理）の画面構造
各群の詳細画面のレイアウト

---

## 5. 命名規則・実装ルール
### 5.1. ファイル構成
スタイル定義は機能群（Group）ごとにプレフィックスを付けて管理します。
* `common/styles.ts`: プレフィックスなし（例: `container`, `card`）
* `member/styles.ts`: `mem`（例: `memStatusLabel`）
* `announcement/styles.ts`: `ann`（例: `annPinnedCard`）

### 5.2. コード書式
* **1行80カラム**: 超過する場合はワードラップする。
* **判定文の改行**: 並列する条件分岐は1つずつ改行する。
* **CSS定義**: スタイル定義内の各プロパティは必ず改行して記述する。

---

## 6. ファイルヘッダー (共通規約)
すべてのソースコードの先頭に以下の形式のコメントを付与します。
```typescript
/**
 * Filename: [実際のファイル名]
 * Version : Vx.y.z
 * Update  : YYYY-MM-DD
 * Remarks : 
 * バージョン - 追加/修正内容の概略
 */
```

---

# 🎨 style_common.ts の最終構造（V2.0.0）
style_common.ts は UI コンポーネントの定義ファイル。
ページ固有のレイアウトは入れず、
アプリ全体で使う UI の“部品”だけを定義する。

## 1. Design Tokens（色・余白・角丸・フォント）
export const colors = {
  background: "#194E5D",
  border: "#1E5E70",
  inputBackground: "#08191E",
  text: "#FFFFFF",
  textSub: "lightgray",
  // Badge Colors（Status）
  status: {
    active: "#2A8F6A",
    pending: "#D98A3A",
    inactive: "#555555",
    danger: "#C94A4A",
    warning: "#D9B63A",
    info: "#1E5E70",
    unread: "#1E90FF",
  },
};
export const radius = {
  card: 12,
  input: 8,
  button: 20,
  badge: 10,
};
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
};
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
};
## 2. Container / Content（画面の骨格）
export const container = {
  minHeight: "100vh",
  backgroundColor: colors.background,
  padding: spacing.lg,
};
export const content = {
  maxWidth: 500,
  margin: "0 auto",
  paddingBottom: 80, // BottomNav 分
};
## 3. Card（情報ブロック）
export const card = {
  backgroundColor: colors.background,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.card,
  padding: spacing.lg,
};
## 4. CardInput（入力欄）
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
};
## 5. Button / CardButtonGroup（操作系）
export const button = {
  base: {
    height: 40,
    borderRadius: radius.button,
    padding: "0 16px",
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
  },
  primary: {
    backgroundColor: colors.info,
    color: colors.text,
  },
  secondary: {
    backgroundColor: "transparent",
    border: `1px solid ${colors.info}`,
    color: colors.info,
  },
  cancel: {
    backgroundColor: colors.status.danger,
    color: colors.text,
  },
  inactive: {
    backgroundColor: colors.status.inactive,
    color: colors.textSub,
  },
};
export const buttonGroup = {
  display: "flex",
  flexDirection: "column",
  gap: spacing.md,
};
## 6. Badge（状態ラベル）
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
};
## 7. ListItemCard（一覧カード）
### ✔ Simple（会員・お知らせ）
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
};
### ✔ Event（イベント専用）
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
};

# 🎯 style_common.ts と style_xxx.ts の役割分担
# 🧱 1. style_common.ts の役割（UI コンポーネントの“すべて”）
style_common.ts は アプリ全体の UI の基盤。
ここには 再利用可能な UI コンポーネントの定義だけ を置く。
## ✔style_common.ts に入れるもの
- Container
- Content
- Card
- CardInput
- Button
- CardButtonGroup
- Badge
- ListItemCardSimple
- ListItemCardEvent
- 色・余白・角丸・フォント（デザイントークン）
- 共通の flex レイアウト
- 共通のボタンサイズ
- 共通のアイコンサイズ
- 共通のテキストスタイル
## ✔ style_common.ts に入れないもの
- ページ固有の配置
- ページ固有の余白調整
- ページ固有の見出し
- ページ固有のフィルタ行
- ページ固有のグリッド
- ページ固有のスクロール制御

# 🧩 2. style_member.ts の役割（会員管理ページ固有）
会員管理ページは、
- フィルタ行
- 検索バー
- 会員一覧の上下余白
- ページタイトルの位置
など、ページ固有のレイアウトが存在する。
## ✔style_member.ts に入れるもの
- フィルタ行のレイアウト
- 検索バーの配置
- ページタイトルの余白
- ListItemCardSimple を並べる List の余白
- スクロール領域の高さ調整
- 固有のアイコン配置（必要なら）
## ✔ style_member.ts に入れないもの
- Card
- Badge
- ListItemCardSimple
- Button

# 🧩 3. style_announcement.ts の役割（お知らせ管理ページ固有
お知らせ管理は、
- 「新規作成」ボタンの位置
- 公開日とタイトルの縦並び
- 一覧の上下余白
- 検索ボタンの位置
などが固有。
## ✔ style_announcement.ts に入れるもの
- ページタイトルの余白
- 新規作成ボタンの配置
- 検索ボタンの配置
- ListItemCardSimple のリスト余白
- 公開日とタイトルの縦並び調整
- ページ固有のスクロール調整

# 🎉 4. style_event.ts の役割（イベント一覧ページ固有）
イベント一覧は、
- 月ごとの見出し
- 日付の左寄せ
- ListItemCardEvent の上下余白
- カレンダー的な区切り
などが固有。
## ✔ style_event.ts に入れるもの
- 月見出しのスタイル
- 月ごとの余白
- ListItemCardEvent のリスト余白
- スクロール領域の調整
- イベント管理ページ固有のボタン配置（管理パネルなど）

