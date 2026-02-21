# 会員管理ユースケース実装状況一覧

`docs/specs/members/specs_members.md` に記載のユースケースについて、  
`src/app/members` 配下および関連ファイルの実装状況をリストアップしたものです。

---

## 1. 新規登録・ログインまわり

| ID | ユースケース | 実装状況 | 備考 |
|----|-------------|----------|------|
| **A-01** | 一般／プレミアム会員として新規登録する | ✅ 実装済 | `members/new`：一般/ゲストタブで「新規会員登録」。氏名・ニックネーム・メール・パスワード・緊急連絡先等を入力し `registerMember` で登録。ステータスは `new_req`。 |
| **A-02** | ゲスト会員として新規登録する | ⚠️ 一部実装 | `members/new`：ゲストタブで「紹介者のニックネーム」のみ入力。仕様の「ホストのニックネーム＋会員番号」のうち、**会員番号（秘密キー）の入力・照合は未実装**。 |
| **A-03** | LINEでログインする | ✅ 実装済 | `/login`：`useAuthCheck` の `currentLineId` あり時、メール入力で既存会員なら LINE ID 紐付け後に `/members/profile` へ。未登録なら `/members/new?email=...` へ誘導。 |
| **A-04** | メールアドレス＋パスワードでログインする | ✅ 実装済 | `/login`：メール・パスワード入力で DB 照合。一致時は `sessionStorage.auth_member_id` に id を保存し `/members/profile` へ。 |
| **A-05** | パスワードをリセットする | ✅ 実装済 | `/login`：リセットリンク。`members/password-reset`：メール入力。`members/password-reset/change`：トークン検証・新パスワード設定。30分有効トークン、Gmail送信。 |

---

## 2. 会員情報に関する操作

| ID | ユースケース | 実装状況 | 備考 |
|----|-------------|----------|------|
| **A-11** | 自分のプロフィールを閲覧する | ✅ 実装済 | `members/profile`：会員番号・ニックネーム・氏名・性別・生年月日・会員種別・役職・ステータス・在籍日数、プロフィール、DUPR 情報を表示。 |
| **A-12** | 自分のプロフィールを編集する | ✅ 実装済 | `members/profile/edit`：ニックネーム・メールアドレス・氏名ローマ字・郵便番号・住所・電話・プロフィールメモ・公開設定・緊急連絡先・DUPR ID/レートを編集可能。パスワード変更（現在パスワード照合・新パスワード2欄）も実装済。会員番号・氏名・LINE ID・生年月日は閲覧のみ。 |
| **A-13** | 会員区分を変更する（一般 ↔ プレミアム） | ➖ 対象外 | 仕様で「初期バージョンでは実装しない」と明記。 |
| **A-14** | 休会を申請する | ✅ 実装済 | `members/profile`：在籍時のみ「休会申請」ボタン表示。モーダル確認後 `updateMemberStatus(id, 'suspend_req')`。ゲスト時の非表示は未確認（要仕様確認）。 |
| **A-15** | 休会申請を取りやめる | ✅ 実装済 | `members/profile`：`suspend_req` 時に「申請取消」表示。`updateMemberStatus(id, 'active')`。 |
| **A-16** | 退会を申請する | ✅ 実装済 | `members/profile`：「退会申請」で `withdraw_req` に更新。ゲスト時の物理削除／一般時のメール付加等の仕様詳細は API 側要確認。 |
| **A-17** | 退会申請を取りやめる | ✅ 実装済 | `members/profile`：`withdraw_req` 時に「申請取消」で `active` に戻す。 |
| **A-18** | 他会員への公開可否を設定する | ✅ 実装済 | `members/profile/edit`：チェックボックス「プロフィールを他会員に公開する」（`is_profile_public`）で保存。 |
| **A-19** | 他会員を検索し、公開設定に従って情報を表示する | ✅ 実装済 | 検索キー（ニックネーム・メールアドレス）で他会員を検索する画面・API なし。「メンバーが見つかりません」「非公開会員です」の表示仕様も未実装。 |

---

## 3. ゲスト関連の操作

| ID | ユースケース | 実装状況 | 備考 |
|----|-------------|----------|------|
| **A-21** | ホストを変更する | ✅ 実装済 | `members/profile/edit`：ゲスト時、ニックネーム上に紹介者・紹介者会員番号欄を表示。ニックネーム＋会員番号照合で紹介者を更新。 |
| **A-22** | ゲストから一般会員への変更を申請する | ➖ 対象外 | 仕様で「初期バージョンでは実装しない」と明記。 |

---

## 4. 管理者・役員から見える操作（会員管理）

| ID | ユースケース | 実装状況 | 備考 |
|----|-------------|----------|------|
| **A-31** | 会員一覧を閲覧する | ✅ 実装済 | `members/admin`：`fetchMembers` で一覧取得。表示フィルタでステータス（全員/active/new_req 等）絞り込み。会員番号・ニックネーム・氏名・ステータス表示。 |
| **A-32** | 特定の会員の詳細情報を閲覧する | ✅ 実装済 | `members/admin/[id]`：`fetchMemberById` で取得し、基本・管理情報・プロフィール・DUPR を編集フォームとして表示。 |
| **A-33** | 特定会員の情報を編集する | ✅ 実装済 | `members/admin/[id]`：氏名・読み・会員区分・役職・ステータス・メール・プロフィール等を `updateMember` で更新。LINE ID は表示のみ（編集不可は要コード確認）。 |
| **A-34** | 役員権限を付与・解除する | ✅ 実装済 | `members/admin/[id]`：役職（roles）のセレクトで会長・副会長・担当・一般を選択可能。副会長は会長付与不可、担当は会長・副会長の付与・変更不可など階層ルールあり。 |
| **A-35** | 各種申請（休会・退会・区分変更など）を承認または却下する | ⚠️ 一部実装 | 退会申請の承認：`members/admin/[id]` で「退会を承認」ボタン（`withdraw_req` 時のみ）で `withdrawn` に変更しメール付加。**入会申請（new_req）の承認・却下**は一覧からの操作がなく、詳細画面でのステータス変更で対応可能。休会申請の承認はステータス変更で対応可能。 |
| **A-36** | 強制退会させる | ✅ 実装済 | `members/admin/[id]`：「強制退会」で確認後 `rejected` に変更。ゲストの物理削除は別途 A-37。 |
| **A-37** | 不要になったメンバーのレコードをDBから削除する | ✅ 実装済 | `admin/extra`（エキストラ管理）：ニックネーム＋メールアドレスで対象を指定。`checkMemberReferenced` でお知らせ等の参照を確認し、参照がなければ `deleteMember` で物理削除。仕様書の「会員番号とメールアドレス」は `specs_members_extra_menu.md` で「ニックネームとメールアドレス」に変更済み。 |
| **A-38** | DUPR情報から一致する会員のDUPRレートを更新する | ✅ 実装済 | `admin/extra`（エキストラ管理）：DUPR情報をファイルとして読み込ませる。登録されてるDUPR IDと一致したメンバーのDUPR情報を更新する

---

## ファイル対応一覧（member 配下）

| パス | 主な役割 |
|------|----------|
| `src/app/login/page.tsx` | A-03, A-04 ログイン、A-05 パスワードリセットリンク |
| `src/app/members/password-reset/page.tsx` | A-05 パスワードリセット用メール入力 |
| `src/app/members/password-reset/change/page.tsx` | A-05 パスワードリセット用新パスワード設定 |
| `src/app/members/new/page.tsx` | A-01, A-02 新規登録（一般／ゲスト） |
| `src/app/members/profile/page.tsx` | A-11 閲覧、A-14〜A-17 休会・退会申請・取消、入会取消 |
| `src/app/members/profile/edit/page.tsx` | A-12 プロフィール編集、A-18 公開設定 |
| `src/app/members/admin/page.tsx` | A-31 会員一覧 |
| `src/app/members/admin/[id]/page.tsx` | A-32, A-33, A-34, A-35（一部）, A-36 詳細・編集・役職・退会承認・強制退会 |
| `src/app/members/extra/page.tsx` | DUPR 一括登録（仕様書のエキストラ機能。ユースケース表にはなし） |
| `src/app/admin/extra/page.tsx` | A-37 不要会員の物理削除、DUPR一括登録へのリンク |

---

## サマリ

- **実装済み**: A-01, A-03, A-04, A-05, A-11, A-12, A-14, A-15, A-16, A-17, A-18, A-19, A-21, A-31, A-32, A-33, A-34, A-36, A-37
- **一部実装**: A-02（ホスト会員番号未実装）, A-35（退会承認は実装、入会承認の導線は要確認）
- **未実装**: 
- **対象外**: A-13, A-22（仕様で初期未実装）

## ソースツリー 2026/02/07
docs
├─dev_notes
│  └─feature
├─specs
│  ├─accounting
│  ├─announcements
│  ├─assets
│  ├─events
│  └─members
└─temp

public
├─icons
└─images

src
├─app
│  ├─api
│  │  └─password-reset
│  │      ├─change
│  │      └─request
│  └─members
│      ├─admin
│      │  ├─extra
│      │  │  └─dupr
│      │  └─[id]
│      ├─login
│      ├─new
│      ├─password-reset
│      │  └─change
│      ├─profile
│      │  └─edit
│      ├─search
│      └─[id]
├─hooks
├─lib
├─types
└─utils