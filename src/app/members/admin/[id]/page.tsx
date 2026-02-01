/**
 * Filename: src/app/members/admin/[id]/page.tsx
 * Version : V2.5.5
 * Update  : 2026-02-01
 * Remarks : 
 * V2.5.5 - 修正：プロフィール編集(V2.4.1)の安定パターンを適用。
 * 非同期データ取得とステータス管理を整理し、テストの安定性を向上。
 */

'use client'

import {
  useState,
  useEffect,
  use,
  useCallback
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  fetchMemberById,
  updateMember
} from '@/lib/memberApi'
import {
  Member,
  MEMBER_STATUS_LABELS,
  MEMBER_KIND_LABELS,
  ROLES,
  ROLES_LABELS,
  MemberStatus
} from '@/types/member'

const STATUS_OPTIONS = Object.entries(MEMBER_STATUS_LABELS) as [MemberStatus, string][]

export default function MemberDetailAdmin(
  { params }: { params: Promise<{ id: string }> }
) {
  const router = useRouter()
  const { id } = use(params)
  const {
    user: currentUser,
    isLoading: authLoading,
    userRoles: currentUserRole
  } = useAuthCheck()

  const [formData, setFormData] = useState<any>(null)
  const [originalMember, setOriginalMember] = useState<Member | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canManage = useCallback((role: string | null | undefined) => {
    return (
      role === ROLES.SYSTEM_ADMIN ||
      role === ROLES.PRESIDENT ||
      role === ROLES.VICE_PRESIDENT ||
      role === ROLES.MEMBER_MANAGER
    )
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!currentUser || !canManage(currentUserRole)) {
      router.replace('/members/profile')
      return
    }

    async function load() {
      try {
        const res = await fetchMemberById(id)
        if (res.success && res.data) {
          setOriginalMember(res.data)
          setFormData({
            ...res.data,
            // 数値項目が null の場合に input type="number" でエラーにならないよう処理
            dupr_rate_doubles: res.data.dupr_rate_doubles ?? '',
            dupr_rate_singles: res.data.dupr_rate_singles ?? '',
          })
        }
      } catch (error) {
        console.error('Failed to load member:', error)
      }
    }
    load()
  }, [id, authLoading, currentUser, currentUserRole, router, canManage])

  // 実績のあるガード条件
  if (authLoading || !formData) {
    return (
      <div style={styles.container} data-testid="loading-state">
        読み込み中...
      </div>
    )
  }

  const handleSave = async () => {
    if (!formData || !originalMember) return

    // 役職変更の認可階層ルール
    if (formData.roles !== originalMember.roles) {
      if (currentUserRole === ROLES.VICE_PRESIDENT) {
        if (formData.roles === ROLES.PRESIDENT) {
          alert('権限がありません：副会長は会長権限を付与できません。')
          return
        }
        if (originalMember.roles === ROLES.PRESIDENT) {
          alert('権限がありません：会長の役職は変更できません。')
          return
        }
      }

      if (currentUserRole === ROLES.MEMBER_MANAGER) {
        if (
          formData.roles === ROLES.PRESIDENT ||
          formData.roles === ROLES.VICE_PRESIDENT
        ) {
          alert('権限がありません：会長・副会長権限は付与できません。')
          return
        }
        if (
          originalMember.roles === ROLES.PRESIDENT ||
          originalMember.roles === ROLES.VICE_PRESIDENT
        ) {
          alert('権限がありません：会長・副会長の役職は変更できません。')
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        dupr_rate_doubles: formData.dupr_rate_doubles === '' 
          ? null 
          : parseFloat(formData.dupr_rate_doubles),
        dupr_rate_singles: formData.dupr_rate_singles === '' 
          ? null 
          : parseFloat(formData.dupr_rate_singles),
      }

      const res = await updateMember(id, submitData)
      if (res.success) {
        alert('更新しました')
        setOriginalMember(submitData)
      } else {
        alert(res.error?.message || '更新に失敗しました')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickStatusChange = async (
    nextStatus: MemberStatus,
    email?: string
  ) => {
    if (!formData) return
    const updateData: any = { status: nextStatus }
    if (email) updateData.email = email
    if (nextStatus === 'withdrawn') {
      updateData.retire_date = new Date().toISOString()
    }
    if (nextStatus === 'rejected') {
      updateData.reject_date = new Date().toISOString()
    }

    setFormData({ ...formData, ...updateData })
    // ステート更新後に保存処理をキック
    setTimeout(() => handleSave(), 100)
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>会員詳細編集 (管理者)</h1>

        {/* 1. 基本・管理情報（プロフィール画面の基本情報と同じ並び順） */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>基本・管理情報</h2>
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="member_number">会員番号</label>
              <input
                id="member_number"
                type="text"
                value={formData.member_number || ''}
                onChange={(e) =>
                  setFormData({ ...formData, member_number: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="nickname">ニックネーム</label>
              <input
                id="nickname"
                type="text"
                value={formData.nickname || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="name">氏名（漢字）</label>
              <input
                id="name"
                type="text"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="name_roma">氏名（ローマ字）</label>
              <input
                id="name_roma"
                type="text"
                value={formData.name_roma || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name_roma: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="gender">性別</label>
              <select
                id="gender"
                value={formData.gender || ''}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value || null })
                }
                style={styles.input}
              >
                <option value="">未選択</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="birthday">生年月日</label>
              <input
                id="birthday"
                type="date"
                value={formData.birthday || ''}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value || null })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">メールアドレス</label>
              <input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="member_kind">会員種別</label>
              <select
                id="member_kind"
                value={formData.member_kind || ''}
                onChange={(e) =>
                  setFormData({ ...formData, member_kind: e.target.value })
                }
                style={styles.input}
              >
                {Object.entries(MEMBER_KIND_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="roles">役職（システム権限）</label>
              <select
                id="roles"
                value={formData.roles}
                onChange={(e) =>
                  setFormData({ ...formData, roles: e.target.value })
                }
                style={styles.input}
              >
                {Object.entries(ROLES_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="status">ステータス</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as MemberStatus })
                }
                style={styles.input}
              >
                {STATUS_OPTIONS.map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 2. プロフィール（プロフィール画面と同じ並び順） */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>プロフィール</h2>
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="postal">郵便番号</label>
              <input
                id="postal"
                type="text"
                value={formData.postal || ''}
                onChange={(e) =>
                  setFormData({ ...formData, postal: e.target.value || null })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="address">住所</label>
              <input
                id="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value || null })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="tel">電話番号</label>
              <input
                id="tel"
                type="text"
                value={formData.tel || ''}
                onChange={(e) =>
                  setFormData({ ...formData, tel: e.target.value || null })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="profile_memo">プロフィールメモ</label>
              <textarea
                id="profile_memo"
                value={formData.profile_memo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, profile_memo: e.target.value || null })
                }
                style={styles.textarea}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="emg_tel">緊急連絡先電話</label>
              <input
                id="emg_tel"
                type="text"
                value={formData.emg_tel || ''}
                onChange={(e) =>
                  setFormData({ ...formData, emg_tel: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="emg_rel">続柄</label>
              <input
                id="emg_rel"
                type="text"
                value={formData.emg_rel || ''}
                onChange={(e) =>
                  setFormData({ ...formData, emg_rel: e.target.value })
                }
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="emg_memo">緊急連絡メモ</label>
              <textarea
                id="emg_memo"
                value={formData.emg_memo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, emg_memo: e.target.value || null })
                }
                style={styles.textareaSmall}
              />
            </div>
          </div>
        </section>

        {/* 3. 競技情報 (DUPR)（プロフィール画面と同じ並び順） */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>競技情報 (DUPR)</h2>
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="dupr_id">DUPR ID</label>
              <input
                id="dupr_id"
                type="text"
                value={formData.dupr_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dupr_id: e.target.value || null })
                }
                placeholder="例: WKRV2Q"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="dupr_rate_doubles">Doubles Rating</label>
              <input
                id="dupr_rate_doubles"
                type="number"
                step="0.001"
                value={formData.dupr_rate_doubles ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dupr_rate_doubles: e.target.value === '' ? '' : e.target.value,
                  })
                }
                placeholder="0.000"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="dupr_rate_singles">Singles Rating</label>
              <input
                id="dupr_rate_singles"
                type="number"
                step="0.001"
                value={formData.dupr_rate_singles ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dupr_rate_singles: e.target.value === '' ? '' : e.target.value,
                  })
                }
                placeholder="0.000"
                style={styles.input}
              />
            </div>
          </div>
        </section>

        <div style={styles.actionArea}>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            style={styles.saveButton}
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>

          <div style={styles.quickActions}>
            {originalMember && originalMember.status === 'withdraw_req' && (
              <button
                onClick={() => {
                  const today = new Date().toISOString()
                    .split('T')[0].replace(/-/g, '')
                  handleQuickStatusChange(
                    'withdrawn', 
                    `${originalMember.email}_withdrawn_${today}`
                  )
                }}
                style={styles.approveButton}
              >
                退会を承認
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('本当に拒否/強制退会させますか？')) {
                  handleQuickStatusChange('rejected')
                }
              }}
              style={styles.rejectButton}
            >
              強制退会
            </button>
          </div>

          <button onClick={() => router.back()} style={styles.backButton}>
            戻る
          </button>
        </div>
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
    maxWidth: '500px',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '30px',
    textAlign: 'center',
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
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#888',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical',
  },
  textareaSmall: {
    width: '100%',
    height: '60px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical',
  },
  actionArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '40px',
    paddingBottom: '80px',
  },
  saveButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  quickActions: {
    display: 'flex',
    gap: '10px',
  },
  approveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'orange',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  rejectButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#333',
    color: '#ff4d4f',
    border: '1px solid #444',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#888',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: '10px',
  }
}