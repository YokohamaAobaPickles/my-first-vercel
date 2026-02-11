/**
 * Filename: src/types/styles/style_common.ts
 * Version : V1.0.1
 * Update  : 2026-02-11
 * Remarks : V1.0.1 - 文法エラーの修正 (オブジェクト内の const 削除)、React インポート追加
 * V1.0.0 - 全機能共通のダークテーマ・ベーススタイル
 */

import React from 'react';

export const baseStyles: Record<string, React.CSSProperties> = {
  // 表示領域全体
  container: {
    backgroundColor: '#1E5E70',
    color: '#FFFFFF',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  // カード形式(一覧表示)
  card: {
    backgroundColor: '#194E5D',
    border: '1px solid #1E5E70',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  // リンク
  link: {
    color: '#08A5EF',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  // ボタン非アクティブ時：塗りつぶしは背景色と同じ
  buttonInactive: {
    backgroundColor: '#1E5E70',
    border: '1px solid #194E5D',
    color: 'white',
    cursor: 'pointer',
  },
  // ボタンアクティブ時：背景色はボックス背景と同じ
  buttonActive: {
    backgroundColor: '#194E5D',
    border: '1px solid white',
    color: 'white',
    fontWeight: 'bold',
  },
  // ログインボタン
  loginButton: {
    width: '100%',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '16px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '10px',
    marginBottom: '20px',
    cursor: 'pointer',
  },
  // ログアウトボタン
  logoutButton: {
    color: '#888',
    backgroundColor: '#111',
    textDecoration: 'none',
    padding: '8px 16px',
    border: '1px solid #333',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  // 入力ボックス
  inputBox: {
    color: '#fff',            // 入力文字色
    backgroundColor: '#222',  // ボックス背景
    width: '100%',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  // ヘッダー
  headerTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.5rem',
    margin: 0,
    marginBottom: '30px',
  },
  // タイトル
  title: {
    fontSize: '1.5rem',
    margin: 0,
  },
  // Copyrightスタイル(通常フッターに表示)
  copyright: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '0.7rem',
    color: '#bfbfbf',
    letterSpacing: '0.05em',
  },
};