/**
 * Filename: src/app/members/admin/extra/page.tsx
 * Version : V3.1.1
 * Update  : 2026-02-01
 * Remarks :
 * V3.1.1 - ファイル位置をapp/adminからapp/members/adminに変更
 * V3.1.0 - 物理削除の指定を「ニックネーム＋メールアドレス」に変更。
 * V3.0.0 - 物理削除を「会員ID＋メールアドレス指定」に変更。確認でOKなら削除、キャンセルなら何もしない。
 * V2.0.0 - 不要会員の物理削除機能を実装（一覧・確認ダイアログ・参照チェック・削除後再取得）。
 * - エキストラ管理ページ（管理者専用）
 * - 1. DUPR技術レベルの一括登録機能
 * - 2. 不要会員の物理削除機能
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import {
  fetchMemberByNicknameAndEmail,
  deleteMember,
  checkMemberReferenced,
} from '@/lib/memberApi'

export default function AdminExtraPage() {
  const router = useRouter()
  const { user, userRoles, isLoading: isAuthLoading } = useAuthCheck()

  const [targetNickname, setTargetNickname] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !canManageMembers(userRoles ?? [])) {
      router.replace('/members/profile')
      return
    }
  }, [user, userRoles, isAuthLoading, router])

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nickname = targetNickname.trim()
    const email = targetEmail.trim()
    if (!nickname || !email) {
      setDeleteMessage('ニックネームとメールアドレスを両方入力してください。')
      return
    }

    setDeleteMessage(null)

    const confirmed = window.confirm(
      `ニックネーム ${nickname}、メールアドレス ${email} を物理削除します。よろしいですか？`
    )
    if (!confirmed) return

    setIsSubmitting(true)

    const fetchRes = await fetchMemberByNicknameAndEmail(nickname, email)
    if (!fetchRes.success || fetchRes.error) {
      setDeleteMessage(
        fetchRes.error?.message ?? '会員の取得に失敗しました。'
      )
      setIsSubmitting(false)
      return
    }
    const member = fetchRes.data
    if (!member) {
      setDeleteMessage(
        'ニックネームとメールアドレスが一致する会員が見つかりません。'
      )
      setIsSubmitting(false)
      return
    }

    const refRes = await checkMemberReferenced(member.id)
    if (!refRes.success || refRes.error) {
      setDeleteMessage(
        refRes.error?.message ?? '参照チェックに失敗しました。'
      )
      setIsSubmitting(false)
      return
    }
    if (refRes.data?.referenced && refRes.data.message) {
      setDeleteMessage(refRes.data.message)
      setIsSubmitting(false)
      return
    }

    const delRes = await deleteMember(member.id)
    if (!delRes.success) {
      setDeleteMessage(delRes.error?.message ?? '削除に失敗しました。')
      setIsSubmitting(false)
      return
    }

    setDeleteMessage('削除しました。')
    setTargetNickname('')
    setTargetEmail('')
    setIsSubmitting(false)
  }

  if (isAuthLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!user || !canManageMembers(userRoles ?? [])) {
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
            <Link href="/members/admin/extra/dupr" style={styles.featureLink}>
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
              削除したい会員のニックネームとメールアドレスを入力し、削除を実行してください。他機能で参照されている場合は削除できません。
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
            <form onSubmit={handleDeleteSubmit} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="delete-member-nickname" style={styles.label}>
                  ニックネーム
                </label>
                <input
                  id="delete-member-nickname"
                  type="text"
                  value={targetNickname}
                  onChange={(e) => setTargetNickname(e.target.value)}
                  placeholder="ニックネーム"
                  style={styles.input}
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>
              <div style={styles.field}>
                <label htmlFor="delete-member-email" style={styles.label}>
                  メールアドレス
                </label>
                <input
                  id="delete-member-email"
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="example@example.com"
                  style={styles.input}
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>
              <button
                type="submit"
                style={styles.deleteButton}
                disabled={isSubmitting}
                aria-label="指定した会員を物理削除"
              >
                {isSubmitting ? '処理中...' : '削除する'}
              </button>
            </form>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#ccc',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.95rem',
  },
  deleteButton: {
    padding: '10px 16px',
    backgroundColor: '#500',
    border: '1px solid #a33',
    borderRadius: '6px',
    color: '#faa',
    cursor: 'pointer',
    fontSize: '0.9rem',
    alignSelf: 'flex-start',
  },
}
