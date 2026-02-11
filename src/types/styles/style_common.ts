/**
 * Filename: src/types/styles/style_common.ts
 * Version : V1.0.1
 * Update  : 2026-02-11
 * Remarks : V1.0.1 - 文法エラーの修正 (オブジェクト内の const 削除)、React インポート追加
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

  // ログイン専用コンテナ
  containerLogin: {
    minHeight: '100vh',
    backgroundColor: '#1E5E70',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },

  // ページ内の本文幅を制御
  content: {
    width: '100%',
    maxWidth: '500px',
    boxSizing: 'border-box',
  },

  // UI のまとまり（カード）
  card: {
    backgroundColor: '#194E5D',
    border: '1px solid #1E5E70',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    boxSizing: 'border-box',
  },

  // リンク
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

  dangerButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
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

  // 入力ボックス
  inputBox: {
    color: '#fff',
    backgroundColor: '#222',
    width: '100%',
    border: '1px solid #444',
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

  headerTitle: {
    fontSize: '2rem',
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
};
