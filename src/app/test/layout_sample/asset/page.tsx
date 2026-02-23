// test/layout_sample/asset/page.tsx
"use client"; // window を参照するため必要

import React, { useEffect, useState } from 'react';  
import { container, getContentStyle, listItemSimple, badge, text } from "@/app/test/style/style_common";
import { assetPage } from "@/app/test/style/style_asset";

export default function AssetPageSample() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth); // 初期値設定
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={container}>
      <div style={getContentStyle(width)}>

        <h2 style={text.title}>設備管理（サンプル）</h2>

        <div style={assetPage.list}>

          {/* 1件目：利用可 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>コートA</div>
              <div style={listItemSimple.sub}>種別：コート</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.active }}>利用可</span>
            </div>
          </div>

          {/* 2件目：故障中 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>コートB</div>
              <div style={listItemSimple.sub}>種別：コート</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.danger }}>故障中</span>
            </div>
          </div>

          {/* 3件目：点検中 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>ネット（予備）</div>
              <div style={listItemSimple.sub}>種別：ネット</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.pending }}>点検中</span>
            </div>
          </div>

          {/* 4件目：貸出中 */}
          <div style={listItemSimple.container}>
            <div style={listItemSimple.left}>
              <div style={listItemSimple.title}>ボールセット（10個）</div>
              <div style={listItemSimple.sub}>種別：ボール</div>
            </div>

            <div style={listItemSimple.right}>
              <span style={{ ...badge.base, ...badge.status.info }}>貸出中</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
