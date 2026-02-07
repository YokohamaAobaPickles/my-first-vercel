# お知らせ管理ユースケース実装状況一覧

`docs/specs/announcements/specs_announcements.md` に記載のユースケースについて、  
`src/app/announcements` 配下および関連ファイルの実装状況をリストアップしたものです。

---
git a
## 1. 一般会員向け操作

| ID | ユースケース | 実装状況 | 備考 |
|----|-------------|----------|------|
| **B-01** | お知らせ一覧を参照する | ✅ 実装済 | `announcements/new`：重要記事（is_pinned）を最上部に固定。未読は太字、既読は通常体で表示 |
| **B-02** | お知らせ詳細を表示する | ✅ 実装済 | `announcements/[id]`：動的ルーティングによる詳細表示。添付ファイル機能は未実装。 |
| **B-03** | 既読を記録する | ✅ 実装済 | `announcements/[id]`：詳細アクセス時に announcement_reads へ LINE ID または Email を自動記録。 |

## 2. 管理者向け操作

| **B-11** | お知らせを作成する | ✅ 実装済 | `announcements/new/[id]`：タイトル、本文、公開日、ピン留め、ステータスを設定して新規作成。 |
| **B-12** | お知らせを編集する | ✅ 実装済 | `announcements/edit/[id]`：存記事の内容更新、公開日・ステータスの変更が可能。 |
| **B-13** | お知らせを無効化する | ✅ 実装済 | `announcements/edit/[id]`：ステータスを disabled に変更することで一般一覧から非表示化。 |
| **B-14** | お知らせを物理削除する | ✅ 実装済 | `announcements/edit/[id]`：編集画面の「削除」ボタンより実行。DBからレコードを完全に削除。 |
| **B-15** | 既読状況を確認する | ✅ 実装済 | `announcements/admin/[id]`：各記事を誰がいつ既読したかを一覧形式で表示。 |


## ファイル対応一覧（member 配下）

| パス | 主な役割 | 対応ユースケース
src/app/announcements/page.tsx
src/app/announcements/page.tsx	一般向けお知らせ一覧（未読/既読の出し分け）	B-01
src/app/announcements/[id]/page.tsx	一般向け詳細表示 ＆ 既読自動記録	B-02, B-03
src/app/announcements/admin/page.tsx	管理者用一覧（既読数表示・各機能への動線）	B-11〜B-15の起点
src/app/announcements/admin/[id]/page.tsx	既読ユーザー詳細リストの表示	B-15
src/app/announcements/new/page.tsx	新規お知らせ作成フォーム	B-11
src/app/announcements/edit/[id]/page.tsx	お知らせ編集・ステータス変更・物理削除	B-12, B-13, B-14

---

## サマリ

- **実装済み**: B-01, B-02, B-03, B-11, B-12, B-13, B-14, B-15
- **一部実装**: 
- **未実装**: 
- **対象外**: B-11, B-12の添付ファイル機能

## 特記事項

- 認証および権限確認には共通フック useAuthCheck と canManageAnnouncements を使用。
- LINE IDを持たないPCユーザー（Emailログイン）でも既読管理が正しく動作するよう実装済み。
- レイアウトはすべて幅800px、ダークモード対応スタイルで統一。

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
│  └─announcements
│     ├─admin
│     │  └─[id]
│     ├─edit
│     │  └─[id]
│     ├─new
│     └─[id]
├─hooks
├─lib
├─types
└─utils