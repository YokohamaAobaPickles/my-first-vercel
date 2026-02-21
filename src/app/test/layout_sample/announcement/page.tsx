// test/layout_sample/announcement/page.tsx

import { container, content, listItemSimple, badge, text } from "@/app/test/style/style_common";
import { announcementPage } from "@/app/test/style/style_announcement";

export default function AnnouncementPageSample() {
  return (
    <div style={container}>
      <div style={content}>

        {/* ページタイトル */}
        <h2 style={text.title}>お知らせ管理（サンプル）</h2>

        {/* 上部：検索ボタン + 新規作成 */}
        <div style={announcementPage.topRow}>
          <button style={announcementPage.newButton}>新規作成</button>
        </div>

        {/* 一覧リスト */}
        <div style={announcementPage.list}>

          {/* 1件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.sub}>公開日：2026-02-01</div>
              <div style={listItemSimple.title}>これは重要な記事。最新順に並ぶ。</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.warning }}>重要</span>
              <span style={{ ...badge.base, ...badge.status.info }}>公開</span>
            </div>
          </div>

          {/* 2件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.sub}>公開日：2026-01-15</div>
              <div style={listItemSimple.title}>これは重要な記事</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.warning }}>重要</span>
              <span style={{ ...badge.base, ...badge.status.info }}>公開</span>
            </div>
          </div>

          {/* 3件目（無効） */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.sub}>公開日：2026-01-15</div>
              <div style={listItemSimple.title}>これは重要な記事</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.warning }}>重要</span>
              <span style={{ ...badge.base, ...badge.status.inactive }}>無効</span>
            </div>
          </div>

          {/* 4件目（下書き） */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.sub}>公開日：2026-01-18</div>
              <div style={listItemSimple.title}>これは下書き中の記事</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.warning }}>重要</span>
              <span style={{ ...badge.base, ...badge.status.warning }}>下書き</span>
            </div>
          </div>

          {/* 5件目（普通の記事） */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.sub}>公開日：2026-01-01</div>
              <div style={listItemSimple.title}>これは普通の記事。重要な記事に次いで最新順に並ぶ</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.info }}>公開</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
