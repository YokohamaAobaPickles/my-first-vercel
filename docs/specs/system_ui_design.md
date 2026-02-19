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

この仕様書をベースに、まずは共通スタイルのリファクタリングから開始しましょうか？あるいは、特定の画面（プロフィール画面など）への適用を優先しますか？