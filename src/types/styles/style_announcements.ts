/**
 * Filename: src/types/styles/style_announcements.ts
 * Version : V1.0.0
 * Update  : 2026-02-09
 * Remarks : お知らせ管理機能固有のスタイル定義
 */

export const annStyles: Record<string, React.CSSProperties> = {
  pinnedCard: {
    borderLeft: '4px solid #ef4444',
    backgroundColor: '#1a1010',
  },
  readBadge: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginLeft: '8px',
  },
  publishDate: {
    color: '#666',
    fontSize: '0.8rem',
  },
  importanceLabel: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  bodyText: {
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: '#d1d5db',
  },
};