/**
 * Filename: src/app/members/profile/page.tsx
 * Version : V2.3.1
 * Update  : 2026-01-30
 * Remarks : 
 * V2.3.1 - 整形：1行80カラム制限、判定文・スタイル定義の改行ルールを適用。
 * V2.3.0 - 追加：ステータスに応じた申請取消（入会/休会/退会）機能の実装。
 * V2.3.0 - 修正：deleteMember への関数名変更を反映。
 */

'use client'

import { useState } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { calculateEnrollmentDays } from '@/utils/memberHelpers'
import { updateMemberStatus, deleteMember } from '@/lib/memberApi'
import { MemberStatus } from '@/types/member'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isLoading, userRoles } = useAuthCheck()
  const router = useRouter()

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'withdraw' | 'cancel_join' | 'cancel_request' | null;
  }>({ isOpen: false, type: null })

  if (isLoading) {
    return <div style={styles.container}>読み込み中...</div>
  }
  if (!user) {
    return null
  }

  const enrollmentDays = calculateEnrollmentDays(user.create_date)

  const handleRequest = async () => {
    if (!user.id || !modalConfig.type) {
      return
    }

    try {
      let res;
      if (modalConfig.type === 'cancel_join') {
        res = await deleteMember(user.id)
        if (res.success) {
          alert('入会申請を取り消しました。')
          router.push('/')
          return
        }
      } else {
        let newStatus: MemberStatus = 'active'
        if (modalConfig.type === 'suspend') {
          newStatus = 'suspend_req'
        }
        if (modalConfig.type === 'withdraw') {
          newStatus = 'withdraw_req'
        }

        res = await updateMemberStatus(user.id, newStatus)
      }

      if (res && res.success) {
        alert('処理が完了しました。')
        setModalConfig({ isOpen: false, type: null })
        window.location.reload()
      } else {
        alert(`エラー: ${res?.error?.message}`)
      }
    } catch (err) {
      alert('予期せぬエラーが発生しました')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new_req: '入会承認待ち',
      active: '有効',
      suspend_req: '休会申請中',
      suspended: '休会中',
      rejoin_req: '復帰申請中',
      withdraw_req: '退会申請中',
      withdrawn: '退会済み'
    }
    return labels[status] || status
  }

  const formattedMemberNumber = user.member_number
    ? String(user.member_number).padStart(4, '0')
    : '-'

  const renderActionButtons = () => {
    if (user.status === 'new_req') {
      return (
        <button
          style={{ ...styles.actionButton, color: '#ff4d4f' }}
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'cancel_join'
          })}
        >
          入会取消
        </button>
      )
    }

    if (user.status === 'suspend_req') {
      return (
        <>
          <button
            style={{ ...styles.actionButton, color: '#aaa' }}
            onClick={() => setModalConfig({
              isOpen: true,
              type: 'cancel_request'
            })}
          >
            休会取消
          </button>
          <button
            style={{ ...styles.actionButton, color: '#ff4d4f' }}
            onClick={() => setModalConfig({
              isOpen: true,
              type: 'withdraw'
            })}
          >
            退会申請
          </button>
        </>
      )
    }

    if (user.status === 'withdraw_req') {
      return (
        <button
          style={{ ...styles.actionButton, color: '#aaa' }}
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'cancel_request'
          })}
        >
          退会取消
        </button>
      )
    }

    if (user.status === 'active') {
      return (
        <>
          <button
            style={{ ...styles.actionButton, color: '#ffa940' }}
            onClick={() => setModalConfig({
              isOpen: true,
              type: 'suspend'
            })}
          >
            休会申請
          </button>
          <button
            style={{ ...styles.actionButton, color: '#ff4d4f' }}
            onClick={() => setModalConfig({
              isOpen: true,
              type: 'withdraw'
            })}
          >
            退会申請
          </button>
        </>
      )
    }
    return null
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        <div style={styles.headerArea}>
          <h1 style={styles.title}>マイプロフィール</h1>
          {canManageMembers(userRoles) && (
            <Link href="/members/admin" style={styles.adminButton}>
              会員管理パネル
            </Link>
          )}
        </div>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>基本情報</h2>
            <div style={styles.buttonGroup}>
              {renderActionButtons()}
            </div>
          </div>
          <div style={styles.card}>
            <InfoRow label="会員番号" value={formattedMemberNumber} />
            <InfoRow label="ニックネーム" value={user.nickname} />
            <InfoRow label="氏名" value={user.name} />
            <InfoRow label="氏名（ローマ字）" value={user.name_roma} />
            <InfoRow label="性別" value={user.gender} />
            <InfoRow label="生年月日" value={user.birthday} />
            <InfoRow
              label="ステータス"
              value={getStatusLabel(user.status)}
              isStatus
            />
            <InfoRow
              label="在籍日数"
              value={typeof enrollmentDays === 'number' ?
                `${enrollmentDays} 日目` : enrollmentDays}
            />
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>プロフィール</h2>
            <button
              onClick={() => router.push('/members/profile/edit')}
              style={styles.actionButton}
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
            <hr style={styles.hr} />
            <h3 style={styles.subTitle}>緊急連絡先</h3>
            <InfoRow label="緊急連絡先" value={user.emg_tel} />
            <InfoRow label="続柄" value={user.emg_rel} />
            <div style={styles.memoRow}>
              <span style={styles.label}>緊急連絡用メモ</span>
              <p style={styles.emgMemoText}>
                {user.emg_memo || '特記事項なし'}
              </p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>競技情報 (DUPR)</h2>
            <button
              style={{ ...styles.actionButton, color: '#0070f3' }}
              onClick={() => alert('DUPR連携機能は準備中です')}
            >
              DUPR更新
            </button>
          </div>
          <div style={styles.card}>
            <InfoRow label="DUPR ID" value={user.dupr_id} />
            <InfoRow label="DUPR Rating" value={user.dupr_rate} />
          </div>
        </section>

        <div style={styles.footer}>
          <Link href="/" style={styles.backLink}>トップページへ戻る</Link>
        </div>
      </div>

      {modalConfig.isOpen && (
        <ConfirmModal
          title={
            modalConfig.type === 'suspend' ? '休会申請' :
              modalConfig.type === 'withdraw' ? '退会申請' :
                modalConfig.type === 'cancel_join' ? '入会申請の取消' : '申請の取消'
          }
          message={
            modalConfig.type === 'suspend'
              ? '休会申請を送信します。よろしいですか？'
              : modalConfig.type === 'withdraw'
              ? '退会申請を送信します。この操作は取り消せません。'
              : modalConfig.type === 'cancel_join'
              ? '入会申請を取り消し、登録データを削除します。よろしいですか？'
              : '申請を取り消して有効な状態に戻します。よろしいですか？'
          }
          onConfirm={handleRequest}
          onCancel={() => setModalConfig({ isOpen: false, type: null })}
        />
      )}
    </div>
  )
}

const ConfirmModal = ({ title, message, onConfirm, onCancel }: any) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ color: '#ccc', fontSize: '0.95rem' }}>{message}</p>
      <div style={styles.modalButtons}>
        <button onClick={onCancel} style={styles.modalCancel}>キャンセル</button>
        <button onClick={onConfirm} style={styles.modalConfirm}>実行する</button>
      </div>
    </div>
  </div>
)

const InfoRow = ({ label, value, isStatus = false }: any) => (
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
    maxWidth: '500px'
  },
  headerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  adminButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: '1px solid #444'
  },
  title: {
    fontSize: '1.5rem',
    margin: 0
  },
  section: {
    marginBottom: '32px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#888',
    fontWeight: 'bold'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  actionButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #444',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222'
  },
  label: {
    color: '#888',
    fontSize: '0.9rem'
  },
  value: {
    fontWeight: 500
  },
  memoRow: {
    paddingTop: '12px'
  },
  memoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    lineHeight: '1.5'
  },
  emgMemoText: {
    fontSize: '0.95rem',
    marginTop: '8px',
    color: '#ffb3b3'
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #333',
    margin: '20px 0'
  },
  subTitle: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '10px'
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center'
  },
  backLink: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '0.9rem'
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
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid #333',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  modalConfirm: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalCancel: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    cursor: 'pointer'
  }
}