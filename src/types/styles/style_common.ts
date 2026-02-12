/**
 * Filename: src/types/styles/style_common.ts
 * Version : V1.1.0
 * Update  : 2026-02-11
 * Remarks : 
 * V1.1.0 - containerLogin背景色修正、BottomNav用スタイル追加
 * V1.0.1 - 文法エラーの修正 (オブジェクト内の const 削除)、React インポート追加
 * V1.0.0 - 全機能共通のダークテーマ・ベーススタイル
 */

import React from 'react';

export const baseStyles: Record<string, React.CSSProperties> = {
  // ページ全体の外枠（背景・余白・配置）
  containerDefault: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#1E5E70',
    color: '#FFFFFF',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },

  // ページ内の本文幅を制御
  content: {
    width: '100%',
    maxWidth: '500px',
    boxSizing: 'border-box',
    // 下部のナビゲーション（約60-80px）に重ならないよう、余裕を持って余白を追加
    paddingBottom: '50px',
  },

  // UI のまとまり（カード）
  card: {
    backgroundColor: '#194E5D',
    border: '1px solid #1E5E70',
    borderRadius: '12px',
    padding: '10px',
    width: '100%',
    boxSizing: 'border-box',
  },

  // リンク(共通)
  link: {
    color: '#08A5EF',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },

  // ボタン（共通）
  primaryButton: {
    width: '100%',
    color: 'white',
    backgroundColor: '#08A5EF',
    border: 'none',
    borderRadius: '30px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '10px',
    marginBottom: '20px',
    cursor: 'pointer',
  },

  secondaryButton: {
    backgroundColor: '#194E5D',
    border: '1px solid #fff',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondaryButtonMinimal: {
    fontSize: '0.75rem',
    backgroundColor: '#0891d1',
    border: '1px solid white',
    color: '#eef9ff',
    padding: '2px 8px',
    borderRadius: '16px',
    cursor: 'pointer',
  },

  dangerButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  // 枠線のみのボタン
  buttonOutline: {
    padding: '10px 16px',
    borderRadius: '30px', // 管理パネルのボタンに合わせる
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    flex: 1,
    transition: '0.2s',
  },
  // --- 管理ボタン ---
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    width: '100%',
  },
  adminButtonSmall: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: '20px',
    //透明ボタン
    //backgroundColor: 'transparent',
    //border: '1px solid #08A5EF',
    //color: '#03abff',
    backgroundColor: '#08A5EF',
    border: '1px solid #08A5EF',
    color: '#eef9ff',
    textDecoration: 'none',
  },
  // 入力ボックス
  inputBox: {
    color: '#fff',
    backgroundColor: '#194E5D',
    width: '100%',
    border: '1px solid #1E5E70',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },

  // ヘッダー
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },

  // ヘッダータイトル
  headerTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    margin: '0 0 30px 0',
  },

  // Copyright
  copyright: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '0.7rem',
    color: '#bfbfbf',
    letterSpacing: '0.05em',
  },

  // ログイン専用コンテナ（背景色を内側のカードと統一）
  containerLogin: {
    minHeight: '100vh',
    backgroundColor: '#194E5D',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },

  // ログイン専用カード
  cardLogin: {
    backgroundColor: '#194E5D',
    border: '1px solid #194E5D',
    borderRadius: '12px',
    padding: '10px',
    width: '100%',
    boxSizing: 'border-box',
  },

  // ログイン専用入力ボックス
  inputBoxLogin: {
    color: '#fff',
    backgroundColor: '#08191E',
    width: '100%',
    border: '1px solid #1E5E70',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
  },

  // ログインボタン（角丸大）
  loginButton: {
    width: '100%',
    color: 'white',
    backgroundColor: '#08A5EF',
    border: 'none',
    borderRadius: '30px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '10px',
    marginBottom: '20px',
    cursor: 'pointer',
  },

  // --- 下部ナビゲーションバー用スタイル ---

  bottomNavContainer: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '500px',
    height: '70px',
    backgroundColor: '#194E5D',
    borderTop: '1px solid #1E5E70',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxSizing: 'border-box',
    zIndex: 1000,
  },

  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#9CA3AF',
    fontSize: '0.65rem',
    textDecoration: 'none',
    cursor: 'pointer',
    flex: 1,
    paddingTop: '6px',
    paddingBottom: '6px',

  },

  navIcon: {
    fontSize: '1.3rem',
    marginBottom: '4px',
  },

  navItemActive: {
    color: '#00D1FF',
    fontWeight: 'bold',
  },
};