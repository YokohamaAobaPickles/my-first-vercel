/**
 * Filename: page.tsx
 * Version: V0.1.0
 * Update: 2026-02-18
 * Remarks: V0.1.0 - ボタン配置・操作感確認用のモックアップ画面
 */
'use client';

import React from 'react';
import { baseStyles } from '@/types/styles/style_common'

export default function LayoutSample() {
  // コンテナ
  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    fontFamily: 'sans-serif',
    // backgroundColor: '#11353f',
    background: 'linear-gradient(to bottom, #11353f 0%, #000000 100%)',
    backgroundAttachment: 'fixed',
  };
  // セクション
  const sectionStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
//    minHeight: '100vh',
    padding: '16px',
    backgroundColor: '#194e5d',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginTop: '2px',
    marginBottom: '2px',
  };
  // UI のまとまり（カード）
  const card: React.CSSProperties = {
    backgroundColor: '#194E5D',
    border: '1px solid #1E5E70',
    borderRadius: '12px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row', //column
    gap: '10px', // ボタン間のスペース
    marginTop: '2px',
    marginBottom: '2px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center'
  };
  const label: React.CSSProperties = {
    padding: '2px',
    backgroundColor: '#194e5d',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginTop: '2px',
    marginBottom: '4px',
  };
  const input: React.CSSProperties = {
    width: '100%',
    flex: 1, // ★ 横幅を自動で揃える
    padding: '8px',
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '6px',
    marginTop: '2px',
    marginBottom: '4px',
  };
  // ボタン（共通）
  const primaryButton: React.CSSProperties = {
    width: '100%',
    color: 'white',
    backgroundColor: '#0b242b',
    border: '#1e5e70',
    borderRadius: '10px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '2px',
    marginBottom: '4px',
    cursor: 'pointer',
  };
  const secondaryButton: React.CSSProperties = {
    width: '100%',
    color: 'white',
    backgroundColor: '#0b242b',
    border: '1px solid #1e5e70',
    borderRadius: '30px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '2px',
    marginBottom: '4px',
    cursor: 'pointer',
  };
  const secondaryButtonProceed: React.CSSProperties = {
    width: '100%',
    color: 'white',
    backgroundColor: 'deepskyblue',
    border: 'none',
    borderRadius: '30px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '2px',
    marginBottom: '4px',
    cursor: 'pointer',
  };


  return (
    <div style={containerStyle} >
      <header>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>
          レイアウト確認用サンプル
        </h2>
      </header>

      {/* 会員アクション想定 */}
      <section style={sectionStyle} >
        <h3 style={{ fontSize: '1rem', color: 'lightgray' }}>
          A群: 会員セクション(sectionTitle)
        </h3>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ ...label, color: 'lightgray' }}>
            メールアドレス入力ラベル
            <input
              id="email"
              type="email"
              name="email"
              placeholder="メールアドレスを入力ボックス内文字"
              style={input}
            />
            <button style={{ ...primaryButton }}>
              編集(PrimaryButton)
            </button>
          </div>

          <hr style={{ borderColor: 'white' }} />

          <button style={{ ...secondaryButtonProceed, width: '75%', alignSelf: 'center' }}>
            ボタン(secondaryButtonProceed)
          </button>

          <button style={{ ...secondaryButton }}>
            ボタン(secondaryButton)
          </button>

          <button style={{ ...secondaryButton, border: '1px solid gray', color: 'gray' }}>
            非アクティブボタン(secondaryButtonInactive)
          </button>
        </div>
      </section >

      {/* お知らせセクション想定 */}
      < section style={sectionStyle} >
        <h3 style={{ fontSize: '1rem', color: 'lightgray' }}>
          B群: お知らせセクション
        </h3>

        <div style={{ ...label, color: 'lightgray' }}>
          ボタンラベル
        </div>

        <div style={{ ...card }}>
          <button style={{ ...secondaryButton, width: 'calc(50% - 5px)', backgroundColor: 'darkgray', color: 'black' }}>
            キャンセル
          </button>
          <button style={{ ...secondaryButton, width: 'calc(50% - 5px)', backgroundColor: 'deepskyblue', color: 'white' }}>
            更新
          </button>
        </div>
        <a href="/test/image_sample" style={baseStyles.Link}>
          イメージサンプル
        </a>

      </section >

      {/* 画面下部固定などのUI確認用 */}
      < footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: '#999' }
      }>
        iPhone / Androidの実機で、指の届きやすさを確認してください。
      </footer >
    </div >
  );
}