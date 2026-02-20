import { container, content, listItemSimple, badge } from "@/app/test/style/style_common";
import { accountingPage } from "@/app/test/style/style_accounting";

export default function AccountingPageSample() {
  return (
    <div style={container}>
      <div style={content}>

        <h2 style={accountingPage.title}>会計管理（サンプル）</h2>

        <div style={accountingPage.list}>

          {/* 1件目：入金済 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>2026-02-01　会費（1月分）</div>
              <div style={listItemSimple.sub}>金額：¥3,000</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.active }}>入金済</span>
            </div>
          </div>

          {/* 2件目：未入金 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>2026-02-01　会費（2月分）</div>
              <div style={listItemSimple.sub}>金額：¥3,000</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.danger }}>未入金</span>
            </div>
          </div>

          {/* 3件目：承認待ち */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>2026-01-28　備品購入</div>
              <div style={listItemSimple.sub}>金額：¥12,000</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.pending }}>承認待ち</span>
            </div>
          </div>

          {/* 4件目：却下 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>2026-01-20　備品購入（ボール）</div>
              <div style={listItemSimple.sub}>金額：¥2,000</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.inactive }}>却下</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
