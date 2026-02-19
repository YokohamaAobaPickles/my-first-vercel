/**
 * Filename: page.tsx
 * Version: V1.1.0
 * Update: 2026-02-19
 * Remarks: V1.1.0 - 前後ページへのナビゲーションリンクを追加
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function MockupDetailPage() {
  const params = useParams();
  const idNum = parseInt(params.id as string, 10);
  
  // ファイル名の組み立て（0埋めなし）
  const fileName = `スライド${idNum}.PNG`; // PowerPointの画像ファイル名はPNGとなる
  const imagePath = `/mockup/${fileName}`;

  // スタイルの定義
  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    color: 'white',
    fontFamily: 'sans-serif',
  };

  const navContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'flex',
    gap: '10px',
    zIndex: 10,
  };

  const linkStyle: React.CSSProperties = {
    backgroundColor: 'rgba(25, 78, 93, 0.9)',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '20px',
    textDecoration: 'none',
    border: '1px solid #1e5e70',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={containerStyle}>
      {/* ナビゲーションエリア */}
      <div style={navContainerStyle}>
        <Link href="/test/mockup" style={linkStyle}>
          ← 一覧
        </Link>
        
        {/* 前のページ：1ページ目以外で表示 */}
        {idNum > 1 && (
          <Link href={`/test/mockup/${idNum - 1}`} style={linkStyle}>
            ＜ 前へ
          </Link>
        )}

        {/* 次のページ：29ページ目以外で表示 */}
        {idNum < 29 && (
          <Link href={`/test/mockup/${idNum + 1}`} style={linkStyle}>
            次へ ＞
          </Link>
        )}
      </div>

      <div style={{ 
        width: '100%', 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <img
          src={imagePath}
          alt={fileName}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '85vh', 
            objectFit: 'contain',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
          }}
        />
      </div>

      <footer style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: 'lightgray' }}>表示中: {fileName}</p>
      </footer>
    </div>
  );
}