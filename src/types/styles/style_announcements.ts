/**
 * Filename: src/types/styles/style_announcements.ts
 * Version : V1.2.0
 * Update  : 2026-02-11
 * Remarks : 
 * V1.2.0 - 新スタイルに完全統一。旧色 (#1a1010, #666 等) を排除し、style_common 基準へ寄せた。
 * V1.1.0 - 管理者画面、既読詳細テーブル、フォーム固有スタイルを追加統合。
 * V1.0.0 - お知らせ管理機能固有のスタイル定義（初期版）
 */

import React from 'react';

export const annStyles: Record<string, React.CSSProperties | any> = {

  // --- 一覧・カード関連 ---
  pinnedCard: {
    borderLeft: '4px solid #ef4444',
    backgroundColor: '#194E5D', // 新スタイルに統一
  },

  importanceLabel: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem', // style_common の小サイズに寄せる
    fontWeight: 'bold',
  },

  readBadge: {
    fontSize: '0.75rem',
    color: '#9CA3AF', // navItem と統一
    marginLeft: '8px',
  },

  publishDate: {
    color: '#9CA3AF', // 旧 #666 を排除
    fontSize: '0.9rem', // style_common の小サイズに寄せる
  },

  // --- 詳細表示関連 ---
  detailContentCard: {
    backgroundColor: '#194E5D', // style_common.card と統一
    padding: '32px',
    borderRadius: '12px',
    marginTop: '16px',
  },

  detailTitle: {
    fontSize: '1.5rem', // headerTitle(2rem) より小さく、統一感のあるサイズ
    fontWeight: 'bold',
    marginBottom: '12px',
    lineHeight: '1.4',
  },

  bodyText: {
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: '#d1d5db', // style_common のテキスト色に近い
  },

  separator: {
    border: 'none',
    borderTop: '1px solid #1E5E70',
    marginBottom: '24px',
  },

  // --- 管理画面 (Admin) 固有 ---
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

  // --- 既読詳細テーブル (Admin Read Details) ---
  tableContainer: {
    width: '100%',
    backgroundColor: '#194E5D', // 旧 #163a45 を排除
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '20px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHeader: {
    backgroundColor: '#1E5E70', // 新スタイルに統一
    color: '#9CA3AF',
    fontSize: '0.85rem',
    textAlign: 'left',
  },

  tableCell: {
    padding: '15px',
    borderBottom: '1px solid #1E5E70',
    fontSize: '0.9rem',
  },

  // --- フォーム (New/Edit) 固有 ---
  formWrapper: {
    backgroundColor: '#194E5D', // style_common.card と統一
    padding: '25px',
    borderRadius: '12px',
    width: '100%',
  },

  fieldGroup: {
    marginBottom: '20px',
  },

  checkboxWrapper: {
    backgroundColor: '#1E5E70', // 旧 #163a45 を排除
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
