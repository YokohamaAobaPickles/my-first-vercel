// test/layout_sample/event/page.tsx

import { container, content, listItemEvent, badge } from "@/app/test/style/style_common";
import { eventPage } from "@/app/test/style/style_event";

export default function EventPageSample() {
  return (
    <div style={container}>
      <div style={content}>

        {/* ページタイトル */}
        <h2 style={eventPage.title}>イベント一覧（サンプル）</h2>

        {/* 2026年2月 */}
        <div style={eventPage.monthHeader}>2026年2月</div>

        <div style={eventPage.list}>

          {/* 1件目：終了 */}
          <div style={listItemEvent.container}>
            <div style={listItemEvent.header}>
              <div style={listItemEvent.date}>17 火</div>
              <div style={listItemEvent.title}>ピックルボール会（定員8名）</div>
              <div style={listItemEvent.badges}>
                <span style={{ ...badge.base, ...badge.status.inactive }}>終了</span>
              </div>
            </div>

            <div style={listItemEvent.info}>
              <div>🕒 12:00 - 15:00</div>
              <div>📍 大場A</div>
            </div>

            <div style={listItemEvent.participants}>
              😊 ○ ○ ○ ○ ○
              <span>+5</span>
            </div>
          </div>

          {/* 2件目：満員 */}
          <div style={listItemEvent.container}>
            <div style={listItemEvent.header}>
              <div style={listItemEvent.date}>19 木</div>
              <div style={listItemEvent.title}>ピックルボール会（定員12名）</div>
              <div style={listItemEvent.badges}>
                <span style={{ ...badge.base, ...badge.status.danger }}>満員</span>
              </div>
            </div>

            <div style={listItemEvent.info}>
              <div>🕒 12:00 - 15:00</div>
              <div>📍 大場A</div>
            </div>

            <div style={listItemEvent.participants}>
              😊 ○ ○ ○ ○ ○
              <span>+4</span>
            </div>
          </div>

          {/* 3件目：受付中 */}
          <div style={listItemEvent.container}>
            <div style={listItemEvent.header}>
              <div style={listItemEvent.date}>25 火</div>
              <div style={listItemEvent.title}>ピックルボール会（定員8名）</div>
              <div style={listItemEvent.badges}>
                <span style={{ ...badge.base, ...badge.status.active }}>受付中</span>
              </div>
            </div>

            <div style={listItemEvent.info}>
              <div>🕒 12:00 - 15:00</div>
              <div>📍 大場A</div>
            </div>

            <div style={listItemEvent.participants}>
              😊 ○ ○ ○ ○ ○
              <span>+5</span>
            </div>
          </div>

        </div>

        {/* 2026年3月 */}
        <div style={eventPage.monthHeader}>2026年3月</div>

        <div style={eventPage.list}>

          {/* 4件目：ステータスなし（未来イベント） */}
          <div style={listItemEvent.container}>
            <div style={listItemEvent.header}>
              <div style={listItemEvent.date}>1 日</div>
              <div style={listItemEvent.title}>ピックルボール会（定員8名）</div>
              <div style={listItemEvent.badges}></div>
            </div>

            <div style={listItemEvent.info}>
              <div>🕒 12:00 - 15:00</div>
              <div>📍 大場A</div>
            </div>

            <div style={listItemEvent.participants}>
              😊 ○ ○ ○ ○ ○
              <span>+5</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
