/**
 * Filename: src/app/members/profile/page.tsx
 * Version : V2.8.0
 * Update  : 2026-02-01
 * Remarks :
 * V2.8.0 - 追加：検索用ボタン
 * V2.7.9 - 追加：基本情報にメールアドレスをニックネームの下に表示。
 * V2.7.8 - 修正：emergency_memo を emg_memo に修正。
 * V2.7.7 - 修正：ログアウト処理を環境別に最適化。
 * LINE内ならウィンドウを閉じ、ブラウザならセッションを切って遷移。
 * V2.7.3 - 変更：会員管理パネルの文字色を水色 (#00d1ff) に変更。
 * V2.7.3 - 変更：休会/退会ボタンの背景を編集ボタンと同じ色 (#111) に統合。
 * V2.7.3 - 追加：生年月日とステータスの間に「会員種別」を表示。
 * V2.7.3 - 調整：緊急連絡先電話、続柄、緊急連絡メモの順序を整理。
 */

'use client'

import { useState } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { calculateEnrollmentDays } from '@/utils/memberHelpers'
import {
  updateMemberStatus,
  deleteMember
} from '@/lib/memberApi'
import {
  MemberStatus,
  MEMBER_STATUS_LABELS,
  MEMBER_KIND_LABELS,
  ROLES_LABELS
} from '@/types/member'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

export default function ProfilePage() {
  const { user, isLoading, userRoles } = useAuthCheck()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'withdraw' | 'cancel_join' | 'cancel_request' | null;
  }>({
    isOpen: false,
    type: null
  })

  if (isLoading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  if (!user) {
    return <div style={styles.container}>ユーザー情報が見つかりません。</div>
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()

    // 自動ログイン抑止
    localStorage.setItem('logout', '1')

    const ua = navigator.userAgent.toLowerCase()
    const isLine = ua.includes('line')

    if (isLine) {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '' })
        await liff.logout()   // ← これが超重要
        liff.closeWindow()
        return
      } catch (e) {
        window.close()
        setTimeout(() => {
          window.location.href = '/members/login'
        }, 300)
        return
      }
    }

    window.location.href = '/members/login'
  }

  const handleAction = async () => {
    if (!modalConfig.type) return
    setIsSubmitting(true)

    try {
      let res
      if (modalConfig.type === 'cancel_join') {
        res = await deleteMember(user.id)
      } else {
        const nextStatus: MemberStatus =
          modalConfig.type === 'suspend' ? 'suspend_req' :
            modalConfig.type === 'withdraw' ? 'withdraw_req' : 'active'
        res = await updateMemberStatus(user.id, nextStatus)
      }

      if (res.success) {
        if (modalConfig.type === 'cancel_join') {
          router.push('/')
        } else {
          window.location.reload()
        }
      } else {
        alert(res.error?.message || 'エラーが発生しました')
      }
    } finally {
      setIsSubmitting(false)
      setModalConfig({ isOpen: false, type: null })
    }
  }

  const enrollmentDays = calculateEnrollmentDays(user.create_date)

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* ヘッダーエリア */}
        <div style={styles.header}>
          <h1 style={styles.title}>マイプロフィール</h1>
          {canManageMembers(userRoles) && (
            <Link href="/members/admin" style={styles.adminButton}>
              会員管理パネル
            </Link>
          )}
        </div>

        {/* 1. 基本情報ブロック */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>基本情報</h2>
            <div style={styles.actionButtons}>
              {user.status === 'new_req' && (
                <button
                  onClick={() => setModalConfig({
                    isOpen: true,
                    type: 'cancel_join'
                  })}
                  style={styles.cancelButton}
                >
                  入会取消
                </button>
              )}
              {user.status === 'active' && (
                <>
                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      type: 'suspend'
                    })}
                    style={styles.suspendButton}
                  >
                    休会申請
                  </button>
                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      type: 'withdraw'
                    })}
                    style={styles.withdrawButton}
                  >
                    退会申請
                  </button>
                </>
              )}
              {(user.status === 'suspend_req' ||
                user.status === 'withdraw_req') && (
                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      type: 'cancel_request'
                    })}
                    style={styles.cancelButton}
                  >
                    申請取消
                  </button>
                )}
            </div>
          </div>
          <div style={styles.card}>
            {[
              { label: '会員番号', value: user.member_number || '-' },
              { label: 'ニックネーム', value: user.nickname },
              { label: 'メールアドレス', value: user.email || '-' },
              { label: '氏名', value: user.name },
              { label: '氏名（ローマ字）', value: user.name_roma || '-' },
              { label: '性別', value: user.gender || '-' },
              { label: '生年月日', value: user.birthday || '-' },
              {
                label: '会員種別', value: MEMBER_KIND_LABELS[user.member_kind] ||
                  user.member_kind ||
                  '一般'
              },
              {
                label: '役職',
                value: userRoles?.map(r => ROLES_LABELS[r] || r).join(', ') || '-'
              },
              {
                label: 'ステータス',
                value: MEMBER_STATUS_LABELS[user.status as MemberStatus] ||
                  user.status,
                color: user.status === 'active' ? '#52c41a' : '#faad14'
              },
              { label: '在籍日数', value: `${enrollmentDays} 日` },
            ].map((item, idx) => (
              <div
                key={idx}
                style={idx === 10 ? styles.infoRowLast : styles.infoRow}
              >
                <span style={styles.label}>{item.label}</span>
                <span style={{
                  ...styles.value,
                  color: item.color || '#fff'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. プロフィールブロック */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>プロフィール</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/members/search" style={styles.editButtonSmall}> 検索 </Link>
              <Link href="/members/profile/edit" style={styles.editButtonSmall}> 編集 </Link>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>郵便番号</span>
              <span style={styles.value}>{user.postal || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>住所</span>
              <span style={styles.value}>{user.address || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>電話番号</span>
              <span style={styles.value}>{user.tel || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>プロフィールメモ</span>
              <span style={styles.value}>{user.profile_memo || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>緊急連絡先電話</span>
              <span style={styles.value}>{user.emg_tel || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>続柄</span>
              <span style={styles.value}>{user.emg_rel || '-'}</span>
            </div>
            <div style={styles.infoRowLast}>
              <span style={styles.label}>緊急連絡メモ</span>
              <span style={styles.value}>{user.emg_memo || '-'}</span>
            </div>
          </div>
        </section>

        {/* 3. 競技情報 (DUPR) ブロック */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>競技情報 (DUPR)</h2>
          </div>
          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>DUPR ID</span>
              <span style={styles.value}>{user.dupr_id || '未登録'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Doubles Rating</span>
              <span style={styles.value}>
                {user.dupr_rate_doubles?.toFixed(3) || '-'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Singles Rating</span>
              <span style={styles.value}>
                {user.dupr_rate_singles?.toFixed(3) || '-'}
              </span>
            </div>
            <div style={styles.infoRowLast}>
              <span style={styles.label}>レート登録日</span>
              <span style={styles.value}>{user.dupr_updated_at || '-'}</span>
            </div>
          </div>
        </section>

        {/* フッターエリア */}
        <div style={styles.footer}>
          {/*}
          <Link href="/members/login" style={styles.logoutLink}>
            ログアウト
          </Link>
        */}
          {/* フッターエリア：リンクからボタンに変更 */}
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            ログアウト
          </button>

        </div>
      </div>

      {/* 確認用モーダル */}
      {modalConfig.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {modalConfig.type === 'suspend' ? '休会申請' :
                modalConfig.type === 'withdraw' ? '退会申請' :
                  modalConfig.type === 'cancel_join' ? '入会取消' : '申請取消'}
            </h3>
            <p style={styles.modalText}>
              {modalConfig.type === 'cancel_join'
                ? '登録情報を完全に削除します。よろしいですか？'
                : 'この操作を実行します。よろしいですか？'}
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setModalConfig({ isOpen: false, type: null })}
                style={styles.cancelBtn}
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                onClick={handleAction}
                style={styles.confirmBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? '処理中...' : '実行する'}
              </button>
            </div>
          </div>
        </div>
      )}
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
}