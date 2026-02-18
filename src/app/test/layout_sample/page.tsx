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
    // backgroundColor: '#11353f', // ダークブルー1色の背景色
    // 背景をグラディエーションにするためには以下の定義を使う
    background: 'linear-gradient(to bottom, #11353f 0%, #000000 100%)',
    backgroundAttachment: 'fixed',
  };
  // セクション
  const sectionStyle: React.CSSProperties = {
    width: '100%',
    height: 'fit-content',
    maxWidth: '500px',
    // minHeight: '100vh', // 画面いっぱいまで表示する場合はこれを有効にする
    padding: '16px',
    backgroundColor: '#194e5d',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginTop: '2px',
    marginBottom: '2px',
  };
  // セクションタイトル
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: 'lightgray',
    display: 'flex',          // 横並びにする
    alignItems: 'center',     // 上下中央揃え
    gap: '8px',               // タイトルとアイコンの間の隙間
    marginBottom: '12px'      // 下の要素との余白
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
    // アイコンと文字を並べるための設定
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px', // アイコンと文字の間隔
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
  const Icons = [
    { id: 1, name: '新聞アイコン', src: '/icons/newspaper.png' },
    { id: 2, name: '会計アイコン', src: '/icons/money.png' },
    { id: 3, name: 'ロックアイコン', src: '/icons/lock.png' },
    { id: 4, name: '救急(svg)', src: '/icons/first_aid.svg' },
    { id: 5, name: '救急(svg_dark)', src: '/icons/first_aid_dark.svg' },
    { id: 6, name: '救急(svg_blue)', src: '/icons/first_aid_blue.svg' },
    { id: 7, name: '救急(svg_office)', src: '/icons/first_aid_office.svg' },
    { id: 8, name: '虫眼鏡', src: '/icons/magnifying_glass.png' },
    { id: 9, name: 'ユーザ', src: '/icons/user.png' },
    { id: 10, name: 'グループ', src: '/icons/users4.png' },
  ];


  return (
    <div style={containerStyle} >
      <header>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>
          レイアウト確認用サンプル
        </h2>
      </header>

      {/* 会員アクション想定 */}
      <section style={sectionStyle} >
        <h3 style={sectionTitleStyle}>
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
            <img
              src={Icons[7].src} // Icons配列の8番目(index 7)を指定
              alt={Icons[7].name}
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            検索ボタン(secondaryButton)
          </button>

          <button style={{ ...secondaryButton, border: '1px solid gray', color: 'gray' }}>
            非アクティブボタン(secondaryButtonInactive)
          </button>
        </div>
      </section >

      {/* お知らせセクション想定 */}
      < section style={sectionStyle} >
        <h3 style={sectionTitleStyle}>
          B群: お知らせセクション
          <img
            src={Icons[2].src} // Icons配列の3番目(index 2)を指定
            alt={Icons[2].name}
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
          />
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

      </section >

      <a href="/test/image_sample" style={baseStyles.Link}>
        イメージサンプル
      </a>

      {/* 画面下部固定などのUI確認用 */}
      < footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: '#999' }
      }>
        iPhone / Androidの実機で、指の届きやすさを確認してください。
      </footer >
    </div >
  );
}