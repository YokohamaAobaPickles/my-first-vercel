/**
 * Filename: src/app/admin/extra/page.tsx
 * Remarks :
 * - エキストラ管理ページ（管理者専用）
 * - 1. DUPR技術レベルの一括登録機能
 * - 2. 不要会員の物理削除機能
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'

export default function AdminExtraPage() {
  const router = useRouter()
  const { user, userRoles, isLoading: isAuthLoading } = useAuthCheck()

  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !userRoles || !canManageMembers(userRoles)) {
      router.replace('/members/profile')
      return
    }
  }, [user, userRoles, isAuthLoading, router])

  if (isAuthLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!user || !canManageMembers(userRoles)) {
    return null
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>エキストラ管理</h1>
          <Link href="/members/admin" style={styles.backLink}>
            会員管理パネルへ戻る
          </Link>
        </header>

        {/* 1. DUPR技術レベルの一括登録機能 */}
        <section style={styles.section} aria-labelledby="section-dupr">
          <h2 id="section-dupr" style={styles.sectionTitle}>
            DUPR技術レベルの一括登録
          </h2>
          <div style={styles.card}>
            <Link href="/members/extra" style={styles.featureLink}>
              DUPR一括登録ページを開く
            </Link>
          </div>
        </section>

        {/* 2. 不要会員の物理削除機能 */}
        <section style={styles.section} aria-labelledby="section-delete">
          <h2 id="section-delete" style={styles.sectionTitle}>
            不要会員の物理削除
          </h2>
          <div style={styles.card}>
            <p style={styles.placeholder}>
              （物理削除機能のUIはここに実装予定）
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
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
    maxWidth: '600px',
  },
  loading: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  backLink: {
    color: '#888',
    textDecoration: 'none',
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#888',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #333',
  },
  placeholder: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
  },
  featureLink: {
    color: '#8cf',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
}
