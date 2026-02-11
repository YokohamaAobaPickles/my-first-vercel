/**
 * Filename: src/types/styles/style_announcements.ts
 * Version : V1.4.0
 * Update  : 2026-02-11
 * Remarks : 
 * V1.4.0 - 詳細ページ用のヘッダー・戻るボタンスタイルを追加。
 * V1.3.1 - 詳細ページのレイアウト最適化（タイトルと本文の隙間、仕切り線）、管理ボタン
 * V1.3.0 - 一覧ページのレイアウト最適化（公開日左寄せ、重要マーク固定、タイトル折り返し、隙間調整）
 * V1.2.0 - 新スタイルに完全統一。旧色 (#1a1010, #666 等) を排除し、style_common 基準へ寄せた。
 * V1.1.0 - 管理者画面、既読詳細テーブル、フォーム固有スタイルを追加統合。
 * V1.0.0 - お知らせ管理機能固有のスタイル定義（初期版）
 */

import React from 'react';

export const annStyles: Record<string, React.CSSProperties | any> = {

  // ============================
  // 一覧ページ（一般利用者向け）
  // ============================

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
    backgroundColor: 'transparent',
    border: '1px solid #08A5EF',
    color: '#08A5EF',
    textDecoration: 'none',
  },

  /** li 全体（縦並び・隙間調整済み） */
  listContainerCard: {
    backgroundColor: '#194E5D',
    padding: '16px',
    borderRadius: '12px',
    marginTop: '16px',
  },

  listItemWrapper: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 0',     // ← 隙間を自然に
    gap: '2px',            // ← 公開日と本文の距離を詰める
    alignItems: 'stretch', // ← 公開日を左端に固定
    borderBottom: '1.5px solid #2A7A90',
  },

  /** 公開日（常に左端） */
  listPublishDate: {
    color: '#9CA3AF',
    fontSize: '0.9rem',
    width: '100%',
    textAlign: 'left',
  },

  /** タイトル行（重要マーク + タイトル） */
  listTitleRow: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    alignItems: 'center', // ← 重要マークを縦に伸ばさない
  },

  /** タイトルリンク（既読/未読で色と太さは上書き） */
  listTitleLink: {
    flex: 1,
    fontSize: '1.1rem',
    lineHeight: '1.4',
    textDecoration: 'none',
  },

  /** 重要マーク（高さ固定で2行化を防止） */
  listImportanceLabel: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    flexShrink: 0,
    height: '20px',        // ← タイトルが2行でも伸びない
    display: 'flex',
    alignItems: 'center',
  },

  pinnedCard: {
    borderLeft: '4px solid #ef4444',
    backgroundColor: '#194E5D',
  },

  importanceLabel: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },

  readBadge: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    marginLeft: '8px',
  },

  publishDate: {
    color: '#9CA3AF',
    fontSize: '0.9rem',
  },

  // ============================
  // 詳細ページ（一般利用者向け）
  // ============================
  detailContentCard: {
    backgroundColor: '#194E5D',
    padding: '32px',
    borderRadius: '12px',
    marginTop: '16px',
  },

  detailTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    lineHeight: '1.4',
  },

  bodyText: {
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: '#d1d5db',
  },

  separator: {
    border: 'none',
    borderTop: '1.5px solid #2A7A90',
    marginBottom: '12px',
  },
  // --- 詳細ページ・ヘッダー関連 ---
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0px',
    width: '100%',
  },
  // 「＜ 戻る」文字
  backButtonMinimal: {
    background: 'none',
    border: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    color: '#9CA3AF', // 控えめなグレー
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  // ============================
  // 管理者者向け一覧画面
  // ============================
  adminCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #1E5E70',
  },

  actionBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  statusBadge: (status: string) => ({
    fontSize: '0.75rem',
    color: status === 'published' ? '#4caf50' : '#9CA3AF',
    padding: '2px 8px',
    borderRadius: '10px',
    border: `1px solid ${status === 'published' ? '#4caf50' : '#9CA3AF'}`,
  }),

  // --- 既読詳細テーブル ---
  tableContainer: {
    width: '100%',
    backgroundColor: '#194E5D',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '20px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHeader: {
    backgroundColor: '#1E5E70',
    color: '#9CA3AF',
    fontSize: '0.85rem',
    textAlign: 'left',
  },

  tableCell: {
    padding: '15px',
    borderBottom: '1px solid #1E5E70',
    fontSize: '0.9rem',
  },

  // --- フォーム ---
  formWrapper: {
    backgroundColor: '#194E5D',
    padding: '25px',
    borderRadius: '12px',
    width: '100%',
  },

  fieldGroup: {
    marginBottom: '20px',
  },

  checkboxWrapper: {
    backgroundColor: '#1E5E70',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #1E5E70',
  },

  deleteSection: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #ff4d4f',
  },
};
