/**
 * Filename: src/app/assets/page.tsx
 * Version : V0.1.1
 * Update  : 2026-02-19
 * Remarks : V0.1.1 - 各種テストページ（モックアップ、イメージ、レイアウト、アイコン）へのリンクを追加
 */
import React from 'react';
import { baseStyles } from '@/types/styles/style_common';

export default function AssetsPage() {
  const linkContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  };

  return (
    <div style={{ padding: '20px' }}>
      <div>
        資源・備品管理（準備中）
        <p>このページは、資源・備品管理機能の開発に向けたダミーファイルです。</p>
      </div>

      <nav style={linkContainerStyle}>
        <a href="/test/mockup" style={baseStyles.Link}>
          モックアップ
        </a>
        
        <a href="/test/image_sample" style={baseStyles.Link}>
          イメージサンプル
        </a>

        <a href="/test/layout_sample" style={baseStyles.Link}>
          レイアウトサンプル
        </a>

        <a href="/test/profile_icon" style={baseStyles.Link}>
          プロファイルアイコン
        </a>
      </nav>
    </div>
  );
}