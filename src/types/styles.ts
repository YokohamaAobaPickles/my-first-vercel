/**
 * Filename: src/types/styles.ts
 * Version : V1.0.0
 * Update  : 2026-02-04
 * 内容：
 * - 表示スタイルの定義
 */

// プロフィールページのスタイル
export const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '1.5rem',
    margin: 0,
  },
  adminButton: {
    backgroundColor: '#111',
    color: '#00d1ff',
    padding: '6px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.75rem',
    border: '1px solid #333',
  },
  editButtonSmall: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.75rem',
    border: '1px solid #333',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#888',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  infoRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0 0',
  },
  label: {
    color: '#888',
    fontSize: '0.9rem',
    width: '120px',        // ★ ラベル幅を固定
    whiteSpace: 'nowrap',  // ★ 改行しない
  },
  value: {
    fontWeight: 500,
    color: '#fff',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  suspendButton: {
    backgroundColor: '#111',
    color: '#ffa940',
    border: '1px solid #333',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  withdrawButton: {
    backgroundColor: '#111',
    color: '#ff4d4f',
    border: '1px solid #333',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    padding: '20px 0',
  },
  logoutLink: {
    color: '#888',
    textDecoration: 'underline',
    fontSize: '0.9rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: '30px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    border: '1px solid #333',
  },
  modalTitle: {
    marginTop: 0,
    fontSize: '1.2rem',
  },
  modalText: {
    color: '#888',
    marginBottom: '24px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: '#888',
    textDecoration: 'underline',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '10px',
  },
  // 検索フォームインプット
  input: {
    width: '100%',
    flex: 1, // ★ 横幅を自動で揃える
    padding: '8px',
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '6px',
  },
  // 検索用ボタン
  searchButton: {
    marginTop: '16px',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '6px',
    border: '1px solid #555',
    cursor: 'pointer',
  },

}