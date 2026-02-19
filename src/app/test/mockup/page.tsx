/**
 * Filename: page.tsx
 * Version: V1.0.1
 * Update: 2026-02-19
 * Remarks: V1.0.1 - 日本語ファイル名（スライドn.png）に対応
 */
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MockupIndexPage() {
  // 1〜29の配列を作成
  const mockupIds = Array.from({ length: 29 }, (_, i) => i + 1);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
    background: 'linear-gradient(to bottom, #11353f 0%, #000000 100%)',
    backgroundAttachment: 'fixed',
    color: 'white',
    fontFamily: 'sans-serif',
  };

  const gridStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
  };

  const tileStyle: React.CSSProperties = {
    width: '128px',
    textAlign: 'center',
    backgroundColor: 'rgba(25, 78, 93, 0.8)',
    borderRadius: '8px',
    padding: '8px',
    border: '1px solid #1e5e70',
  };

  return (
    <div style={containerStyle}>
      <header>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
          モックアップ一覧
        </h1>
      </header>

      <main style={gridStyle}>
        {mockupIds.map((id) => {
          const fileName = `スライド${id}.PNG`; // PowerPointの画像ファイル名はPNGとなる
          const imagePath = `/mockup/${fileName}`;
          
          return (
            <Link 
              key={id} 
              href={`/test/mockup/${id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={tileStyle}>
                <div style={{ width: '112px', height: '112px', position: 'relative', margin: '0 auto' }}>
                  <img
                    src={imagePath}
                    alt={fileName}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '4px' 
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '8px' }}>
                  {fileName}
                </div>
              </div>
            </Link>
          );
        })}
      </main>
    </div>
  );
}