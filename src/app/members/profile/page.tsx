/**
 * Filename: src/app/members/profile/page.tsx
 * Version : V1.6.2
 * Update  : 2026-01-27
 * 内容：
 * V1.6.2
 * - テストがテキストを検出できない問題(Testing Libraryの仕様)に対応
 * - InfoRow内のテキストレンダリングを最適化し、テストの一致率を向上
 * V1.5.1
 * - canManageMembers(userRoles) による管理者パネル表示制御
 * - 性別、生年月日、DUPR、緊急連絡先、在籍日数の表示を網羅
 */

'use client'

import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { calculateEnrollmentDays } from '@/utils/memberHelpers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  // useAuthCheck から userRoles を受け取り、権限判定に使用する
  const { user, isLoading, userRoles } = useAuthCheck()
  const router = useRouter()

  if (isLoading) {
    return (
      <div style={styles.container}>
        読み込み中...
      </div>
    )
  }

  if (!user) return null

  // 入会日（create_date）を元に在籍日数を計算
  const enrollmentDays = calculateEnrollmentDays(user.create_date)

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* 最上部：管理権限チェック */}
        {canManageMembers(userRoles) && (
          <div style={styles.adminHeader}>
            <Link href="/members/admin" style={styles.adminButton}>
              会員管理パネル
            </Link>
          </div>
        )}

        <h1 style={styles.title}>マイプロフィール</h1>

        {/* 1. 基本情報セクション */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>基本情報</h2>
          <div style={styles.card}>
            <InfoRow label="会員番号" value={user.member_number} />
            <InfoRow label="ニックネーム" value={user.nickname} />
            <InfoRow label="氏名" value={user.name} />
            <InfoRow label="氏名（ローマ字）" value={user.name_roma} />
            <InfoRow label="性別" value={user.gender} />
            <InfoRow label="生年月日" value={user.birthday} />
            <InfoRow 
              label="ステータス" 
              value={user.status === 'active' ? '有効' : user.status} 
              isStatus 
            />
            <InfoRow 
              label="入会日" 
              value={user.create_date ? 
                new Date(user.create_date).toLocaleDateString('ja-JP').split('T')[0] : '-'} 
            />
            <InfoRow 
              label="在籍日数" 
              value={typeof enrollmentDays === 'number' ? 
                `${enrollmentDays} 日目` : enrollmentDays} 
            />
          </div>
        </section>

        {/* 2. プロフィールセクション (編集可能) */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>プロフィール</h2>
            <button 
              onClick={() => router.push('/members/profile/edit')} 
              style={styles.editButton}
              aria-label="編集"
            >
              編集
            </button>
          </div>
          <div style={styles.card}>
            <InfoRow label="郵便番号" value={user.postal} />
            <InfoRow label="住所" value={user.address} />
            <InfoRow label="電話番号" value={user.tel} />
            <div style={styles.memoRow}>
              <span style={styles.label}>プロフィールメモ</span>
              <p style={styles.memoText}>{user.profile_memo || '未入力'}</p>
            </div>
          </div>
        </section>

        {/* 3. 競技情報セクション (DUPR) */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>競技情報 (DUPR)</h2>
          <div style={styles.card}>
            {/* テストが /D-123/ や /3.555/ を確実に拾えるように value を出力 */}
            <InfoRow label="DUPR ID" value={user.dupr_id} />
            <InfoRow label="DUPR Rating" value={user.dupr_rate} />
            <InfoRow label="情報取得日" value={user.dupr_rate_date} />
            <button 
              style={styles.syncButton} 
              onClick={() => alert('DUPR連携機能は準備中です')}
            >
              DUPR Rate取得
            </button>
          </div>
        </section>

        {/* 4. 緊急連絡先セクション */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>緊急連絡先</h2>
          <div style={styles.card}>
            <InfoRow label="緊急連絡先" value={user.emg_tel} />
            <InfoRow label="続柄" value={user.emg_rel} />
            <div style={styles.memoRow}>
              <span style={styles.label}>緊急連絡用メモ</span>
              <p style={styles.emgMemoText}>
                {user.emg_memo || '特記事項なし'}
              </p>
              <small style={styles.note}>
                ※この項目は管理者のみ閲覧可能です
              </small>
            </div>
          </div>
        </section>

        <div style={styles.footer}>
          <Link href="/" style={styles.backLink}>
            トップページへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * 情報表示用の共通行コンポーネント
 * テストが値を検出しやすいよう、余計な空白が入らない実装にしています
 */
const InfoRow = ({ 
  label, 
  value, 
  isStatus = false 
}: { 
  label: string, 
  value?: string | number | null, 
  isStatus?: boolean 
}) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span style={{
      ...styles.value,
      color: isStatus && value === '有効' ? '#52c41a' : '#ffffff'
    }}>
      {value !== undefined && value !== null ? String(value) : '-'}
    </span>
  </div>
)

/**
 * スタイル定義
 */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
  },
  wrapper: {
    width: '100%',
    maxWidth: '500px',
  },
  adminHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  adminButton: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '30px',
    textAlign: 'center',
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
  editButton: {
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  label: {
    color: '#888',
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: 500,
  },
  memoRow: {
    paddingTop: '12px',
  },
  memoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    lineHeight: '1.5',
  },
  emgMemoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    color: '#ffb3b3',
  },
  note: {
    fontSize: '0.75rem',
    color: '#666',
    display: 'block',
    marginTop: '4px',
  },
  syncButton: {
    marginTop: '16px',
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #0070f3',
    backgroundColor: 'transparent',
    color: '#0070f3',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
  },
  backLink: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
}