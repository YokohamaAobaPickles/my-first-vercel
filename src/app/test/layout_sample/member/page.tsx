// test/layout_sample/member_page.tsx

import { container, content, listItemSimple, badge, button, text} from "@/app/test/style/style_common";
import { memberPage } from "@/app/test/style/style_member";
//import { text } from "stream/consumers";

export default function MemberPageSample() {
  return (
    <div style={container}>
      <div style={content}>

        {/* ページタイトル */}
        <h2 style={text.title}>プロフィール管理（サンプル）</h2>

        {/* フィルタ行 */}
        <div style={memberPage.filterRow}>
          <div style={memberPage.filterBox}>全員</div>
          <button style={button.search}>検索</button>
        </div>

        {/* 一覧リスト */}
        <div style={memberPage.list}>

          {/* 1件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>横浜青葉ピックルズ（横浜青葉 ピックルズ）</div>
              <div style={listItemSimple.sub}>会員番号：0001 / 種別：一般</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.info }}>会長</span>
              <span style={{ ...badge.base, ...badge.status.active }}>在籍</span>
            </div>
          </div>

          {/* 2件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>横浜たろー（横浜 太郎）</div>
              <div style={listItemSimple.sub}>会員番号：0002 / 種別：プレミアム</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.info }}>お知らせ</span>
              <span style={{ ...badge.base, ...badge.status.active }}>在籍</span>
            </div>
          </div>

          {/* 3件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>ピックミン（横浜 次郎）</div>
              <div style={listItemSimple.sub}>会員番号：0004 / 種別：一般</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.pending }}>休会申請中</span>
            </div>
          </div>

          {/* 4件目 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>ピックルちゃん（青葉 花子）</div>
              <div style={listItemSimple.sub}>会員番号：0005 / 種別：一般</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.inactive }}>退会</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
