/**
 * Filename: src/app/test/page.tsx
 * Version : V0.1.1
 * Update  : 2026-02-20
 * Remarks : Link スタイルを style_common.ts の text.link に統一
 */
import React from 'react';
import { text } from '@/app/test/style/style_common';

export default function TestPage() {
  const linkContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  };

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <p>このページは、サンプル群へのリンクページ</p>
      </div>

      <nav style={linkContainerStyle}>
        <a href="/test/mockup" style={text.link}>
          モックアップ
        </a>
        
        <a href="/test/image_sample" style={text.link}>
          イメージサンプル
        </a>

        <a href="/test/layout_sample" style={text.link}>
          レイアウトサンプル
        </a>

        <a href="/test/profile_icon" style={text.link}>
          プロファイルアイコン
        </a>
      </nav>
    </div>
  );
}
