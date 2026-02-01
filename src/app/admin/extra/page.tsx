/**
 * Filename: src/app/admin/extra/page.tsx
 * Version : V2.0.0
 * Update  : 2026-02-01
 * Remarks :
 * V2.0.0 - 不要会員の物理削除機能を実装（一覧・確認ダイアログ・参照チェック・削除後再取得）。
 * - エキストラ管理ページ（管理者専用）
 * - 1. DUPR技術レベルの一括登録機能
 * - 2. 不要会員の物理削除機能
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import {
  fetchMembers,
  deleteMember,
  checkMemberReferenced,
} from '@/lib/memberApi'
import type { Member } from '@/types/member'

export default function AdminExtraPage() {
  const router = useRouter()
  const { user, userRoles, isLoading: isAuthLoading } = useAuthCheck()

  const [members, setMembers] = useState<Member[]>([])
  const [isListLoading, setIsListLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setIsListLoading(true)
    setDeleteMessage(null)
    const res = await fetchMembers()
    if (res.success && res.data) {
      setMembers(res.data)
    }
    setIsListLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !userRoles || !canManageMembers(userRoles)) {
      router.replace('/members/profile')
      return
    }
    loadMembers()
  }, [user, userRoles, isAuthLoading, router, loadMembers])

  const handleDeleteClick = async (member: Member) => {
    const label = `${member.member_number ?? '—'} ${member.name}（${member.nickname}）`
    const confirmed = window.confirm(
      `会員ID ${member.id}（${label}）を物理削除します。よろしいですか？`
    )
    if (!confirmed) return

    setDeleteMessage(null)

    const refRes = await checkMemberReferenced(member.id)
    if (!refRes.success || refRes.error) {
      setDeleteMessage(
        refRes.error?.message ?? '参照チェックに失敗しました。'
      )
      return
    }
    if (refRes.data?.referenced && refRes.data.message) {
      setDeleteMessage(refRes.data.message)
      return
    }

    const delRes = await deleteMember(member.id)
    if (!delRes.success) {
      setDeleteMessage(delRes.error?.message ?? '削除に失敗しました。')
      return
    }

    await loadMembers()
  }

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
            <p style={styles.help}>
              会員を指定して members テーブルから物理削除します。他機能で参照されている場合は削除できません。
            </p>
            {deleteMessage && (
              <div
                style={styles.messageBox}
                role="alert"
                aria-live="polite"
              >
                {deleteMessage}
              </div>
            )}
            {isListLoading ? (
              <p style={styles.placeholder}>一覧を取得中...</p>
            ) : members.length === 0 ? (
              <p style={styles.placeholder}>会員が0件です。</p>
            ) : (
              <ul style={styles.list}>
                {members.map((m) => (
                  <li key={m.id} style={styles.listItem}>
                    <span style={styles.listLabel}>
                      {m.member_number ?? '—'} {m.name}（{m.nickname}）
                    </span>
                    <span style={styles.listId}>ID: {m.id.slice(0, 8)}…</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(m)}
                      style={styles.deleteButton}
                      aria-label={`${m.name} を物理削除`}
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
    maxWidth: '640px',
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
  help: {
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '12px',
    marginTop: 0,
  },
  messageBox: {
    padding: '12px 16px',
    backgroundColor: '#310',
    border: '1px solid #a60',
    borderRadius: '8px',
    color: '#fa8',
    marginBottom: '12px',
    fontSize: '0.9rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #333',
    fontSize: '0.9rem',
  },
  listLabel: {
    flex: '1 1 auto',
    minWidth: 0,
  },
  listId: {
    color: '#666',
    fontSize: '0.8rem',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#500',
    border: '1px solid #a33',
    borderRadius: '6px',
    color: '#faa',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}
