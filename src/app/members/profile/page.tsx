/**
 * Filename: src/app/members/profile/page.tsx
 * Version : V2.6.0
 * Update  : 2026-01-31
 * Remarks : 
 * V2.6.0 - 変更：自動更新 (syncDuprData) を廃止し、手動入力値の表示に対応。
 * V2.6.0 - 修正：表示プロパティ名を dupr_rate_doubles / singles に統一。
 * V2.6.0 - 整形：1行80カラム制限、判定文・スタイル定義の改行ルールを適用。
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
import { MemberStatus } from '@/types/member'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
        <div style={styles.header}>
          <h1 style={styles.title}>マイプロフィール</h1>
          <Link href="/members/profile/edit" style={styles.editButton}>
            編集
          </Link>
        </div>

        {/* 会員管理パネル (管理者用) */}
        {canManageMembers(userRoles) && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>会員管理パネル</h2>
            <div style={styles.card}>
              <Link href="/admin/members" style={styles.adminLink}>
                会員一覧・承認待ち確認へ
              </Link>
            </div>
          </section>
        )}

        {/* 基本情報 */}
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
            <div style={styles.infoRow}>
              <span style={styles.label}>会員番号</span>
              <span style={styles.value}>{user.member_number || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>ニックネーム</span>
              <span style={styles.value}>{user.nickname}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>氏名</span>
              <span style={styles.value}>{user.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>氏名（ローマ字）</span>
              <span style={styles.value}>{user.name_roma || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>性別</span>
              <span style={styles.value}>{user.gender || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>生年月日</span>
              <span style={styles.value}>{user.birthday || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>ステータス</span>
              <span style={{
                ...styles.value,
                color: user.status === 'active' ? '#52c41a' : '#faad14'
              }}>
                {user.status === 'active' ? '有効' : 
                 user.status === 'new_req' ? '承認待ち' :
                 user.status === 'suspend_req' ? '休会申請中' :
                 user.status === 'withdraw_req' ? '退会申請中' : user.status}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>在籍日数</span>
              <span style={styles.value}>{enrollmentDays} 日</span>
            </div>
          </div>
        </section>

        {/* 競技情報 (DUPR) */}
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
              <span style={styles.label}>DUPR Doubles</span>
              <span style={styles.value}>
                {user.dupr_rate_doubles?.toFixed(3) || '-'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>DUPR Singles</span>
              <span style={styles.value}>
                {user.dupr_rate_singles?.toFixed(3) || '-'}
              </span>
            </div>
            <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
              <p style={styles.guideText}>
                ※情報の変更はプロフィール編集から行えます。
              </p>
            </div>
          </div>
        </section>

        {/* 連絡先情報 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>連絡先・住所</h2>
          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>電話番号</span>
              <span style={styles.value}>{user.tel || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>郵便番号</span>
              <span style={styles.value}>{user.postal || '-'}</span>
            </div>
            <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
              <span style={styles.label}>住所</span>
            </div>
            <div style={styles.memoText}>{user.address || '-'}</div>
          </div>
        </section>

        {/* 緊急連絡先 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>緊急連絡先</h2>
          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>緊急連絡先電話</span>
              <span style={styles.value}>{user.emg_tel}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>続柄</span>
              <span style={styles.value}>{user.emg_rel}</span>
            </div>
            <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
              <span style={styles.label}>緊急用メモ</span>
            </div>
            <div style={styles.emgMemoText}>{user.emg_memo || '-'}</div>
          </div>
        </section>
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
  editButton: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    border: '1px solid #444',
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
  label: {
    color: '#888',
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: 500,
    color: '#fff',
  },
  memoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    lineHeight: '1.5',
    color: '#ddd',
  },
  emgMemoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    color: '#ffb3b3',
  },
  guideText: {
    fontSize: '0.8rem',
    color: '#666',
    margin: 0,
    paddingTop: '4px',
  },
  adminLink: {
    color: '#1890ff',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  suspendButton: {
    backgroundColor: 'transparent',
    color: '#ffa940',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  withdrawButton: {
    backgroundColor: 'transparent',
    color: '#ff4d4f',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
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
}