/**
 * Filename: src/app/members/profile/edit/page.tsx
 * Version : V2.6.0
 * Update  : 2026-02-01
 * Remarks : 
 * V2.6.0 - 追加：ゲスト時のみ紹介者欄・紹介者会員番号欄をニックネーム上に表示。紹介者変更時の照合ロジック。
 * V2.5.0 - 追加：メールアドレス欄、パスワード変更欄（現在・新・確認）、表示切替ボタン。
 * V2.4.1 - 追加：公開設定(is_profile_public)のチェックボックスを追加。
 * V2.4.0 - 統合：Member型(V2.3.0)に準拠。emg_memo等の最新キー名を使用。
 * V2.4.0 - 修正：氏名(ローマ字)、DUPR ID/レートの編集機能を追加。
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  updateMemberProfile,
  updateMemberPassword,
  fetchMemberByNicknameAndMemberNumber
} from '@/lib/memberApi'
import { useRouter } from 'next/navigation'

export default function ProfileEditPage() {
  const { user, isLoading } = useAuthCheck()
  const router = useRouter()
  const [formData, setFormData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false)
  const [introducerMemberNumber, setIntroducerMemberNumber] = useState('')

  const isGuest = formData?.member_kind === 'guest'

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        // 数値項目が null の場合に input type="number" でエラーにならないよう処理
        dupr_rate_doubles: user.dupr_rate_doubles ?? '',
        dupr_rate_singles: user.dupr_rate_singles ?? '',
      })
    }
  }, [user])

  if (isLoading || !formData) {
    return <div style={styles.container}>読み込み中...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const willChangePassword =
      currentPassword.trim() || newPassword.trim() || newPasswordConfirm.trim()

    if (willChangePassword) {
      if (newPassword !== newPasswordConfirm) {
        alert('新パスワードと確認用が一致しません。')
        return
      }
      if (!currentPassword.trim()) {
        alert('パスワードを変更するには現在のパスワードを入力してください。')
        return
      }
      if (!newPassword.trim()) {
        alert('新しいパスワードを入力してください。')
        return
      }
      const pwRes = await updateMemberPassword(
        user.id,
        currentPassword,
        newPassword
      )
      if (!pwRes.success) {
        alert(pwRes.error?.message || 'パスワードの変更に失敗しました。')
        return
      }
    }

    if (isGuest) {
      const introNick = (formData.introducer || '').trim()
      const introNum = introducerMemberNumber.trim()
      const originalIntro = (user.introducer || '').trim()
      const introducerChanged =
        introNick !== originalIntro || introNum !== ''

      if (introducerChanged) {
        if (!introNick || !introNum) {
          alert(
            '紹介者を変更する場合は、ニックネームと会員番号の両方を入力してください。'
          )
          return
        }
        const introRes = await fetchMemberByNicknameAndMemberNumber(
          introNick,
          introNum
        )
        if (!introRes.success || !introRes.data) {
          alert(
            'ニックネームと会員番号が一致する紹介者が見つかりません。'
          )
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const { password: _pw, ...rest } = formData
      const payload = {
        ...rest,
        dupr_rate_doubles: formData.dupr_rate_doubles !== ''
          ? parseFloat(formData.dupr_rate_doubles)
          : null,
        dupr_rate_singles: formData.dupr_rate_singles !== ''
          ? parseFloat(formData.dupr_rate_singles)
          : null,
      }

      const res = await updateMemberProfile(user.id, payload)
      if (res.success) {
        alert('プロフィールを更新しました')
        router.push('/members/profile')
      } else {
        alert(`エラー: ${res.error?.message}`)
      }
    } catch (error) {
      alert('予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value
    setFormData((prev: any) => ({ ...prev, [name]: val }))
  }

  const formatMemberNumber = (num: string | number | null | undefined) => {
    return num ? String(num).padStart(4, '0') : '----'
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>プロフィール編集</h1>

        {/* 1. 基本情報 (閲覧のみ) */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>基本情報 (閲覧のみ)</h2>
          <div style={styles.card}>
            <div style={styles.readOnlyGroup}>
              <span style={styles.label}>会員番号</span>
              <span style={styles.readOnlyValue}>
                {formatMemberNumber(formData.member_number)}
              </span>
            </div>
            <div style={styles.readOnlyGroup}>
              <span style={styles.label}>氏名</span>
              <span style={styles.readOnlyValue}>{formData.name}</span>
            </div>
            <div style={styles.readOnlyGroup}>
              <span style={styles.label}>LINE ID</span>
              <span style={styles.readOnlyValue}>{formData.line_id || '-'}</span>
            </div>
            <div style={styles.readOnlyGroup}>
              <span style={styles.label}>生年月日</span>
              <span style={styles.readOnlyValue}>
                {formData.birthday
                  ? new Date(formData.birthday).toLocaleDateString('ja-JP')
                  : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 1.5 パスワード変更（基本情報ブロックの生年月日の下） */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>パスワード変更</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label htmlFor="current_password" style={styles.label}>
                現在のパスワード
              </label>
              <div style={styles.passwordInputWrapper}>
                <input
                  id="current_password"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={styles.passwordInput}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={styles.visibilityButton}
                  aria-label={showCurrentPw ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showCurrentPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="new_password" style={styles.label}>
                新パスワード
              </label>
              <div style={styles.passwordInputWrapper}>
                <input
                  id="new_password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.passwordInput}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={styles.visibilityButton}
                  aria-label={showNewPw ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showNewPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="new_password_confirm" style={styles.label}>
                新パスワード（確認）
              </label>
              <div style={styles.passwordInputWrapper}>
                <input
                  id="new_password_confirm"
                  type={showNewPwConfirm ? 'text' : 'password'}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  style={styles.passwordInput}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwConfirm(!showNewPwConfirm)}
                  style={styles.visibilityButton}
                  aria-label={showNewPwConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showNewPwConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 編集可能項目 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>編集可能項目</h2>
          <div style={styles.card}>
            {isGuest && (
              <>
                <div style={styles.inputGroup}>
                  <label htmlFor="introducer" style={styles.label}>
                    紹介者
                  </label>
                  <input
                    id="introducer"
                    type="text"
                    name="introducer"
                    value={formData.introducer || ''}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label htmlFor="introducer_member_number" style={styles.label}>
                    紹介者会員番号
                  </label>
                  <input
                    id="introducer_member_number"
                    type="text"
                    placeholder="紹介者の会員番号を入力してください"
                    value={introducerMemberNumber}
                    onChange={(e) => setIntroducerMemberNumber(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </>
            )}
            <div style={styles.inputGroup}>
              <label htmlFor="nickname" style={styles.label}>
                ニックネーム <span style={styles.requiredBadge}>*</span>
              </label>
              <input
                id="nickname"
                type="text"
                name="nickname"
                value={formData.nickname || ''}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="name_roma" style={styles.label}>氏名（ローマ字）</label>
              <input
                id="name_roma"
                type="text"
                name="name_roma"
                value={formData.name_roma || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="postal" style={styles.label}>郵便番号</label>
              <input
                id="postal"
                type="text"
                name="postal"
                value={formData.postal || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="address" style={styles.label}>住所</label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="tel" style={styles.label}>電話番号</label>
              <input
                id="tel"
                type="text"
                name="tel"
                value={formData.tel || ''}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="profile_memo" style={styles.label}>
                プロフィールメモ
              </label>
              <textarea
                id="profile_memo"
                name="profile_memo"
                value={formData.profile_memo || ''}
                onChange={handleChange}
                style={styles.textarea}
              />
            </div>

            {/* 公開設定チェックボックス */}
            <div style={styles.checkboxGroup}>
              <input
                id="is_profile_public"
                type="checkbox"
                name="is_profile_public"
                checked={formData.is_profile_public || false}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="is_profile_public" style={styles.checkboxLabel}>
                プロフィールを他会員に公開する
              </label>
            </div>

            <hr style={styles.hr} />

            <h3 style={styles.subSectionTitle}>緊急連絡先</h3>
            <div style={styles.inputGroup}>
              <label htmlFor="emg_tel" style={styles.label}>
                緊急連絡先電話 <span style={styles.requiredBadge}>*</span>
              </label>
              <input
                id="emg_tel"
                type="text"
                name="emg_tel"
                value={formData.emg_tel || ''}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="emg_rel" style={styles.label}>
                続柄 <span style={styles.requiredBadge}>*</span>
              </label>
              <input
                id="emg_rel"
                type="text"
                name="emg_rel"
                value={formData.emg_rel || ''}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="emg_memo" style={styles.label}>緊急連絡メモ</label>
              <textarea
                id="emg_memo"
                name="emg_memo"
                value={formData.emg_memo || ''}
                onChange={handleChange}
                style={styles.textareaSmall}
              />
            </div>

            <hr style={styles.hr} />

            <h3 style={styles.subSectionTitle}>競技情報 (DUPR)</h3>
            <div style={styles.inputGroup}>
              <label htmlFor="dupr_id" style={styles.label}>DUPR ID</label>
              <input
                id="dupr_id"
                type="text"
                name="dupr_id"
                value={formData.dupr_id || ''}
                onChange={handleChange}
                placeholder="例: ABCDE"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="dupr_rate_doubles" style={styles.label}>
                  DUPR Doubles
                </label>
                <input
                  id="dupr_rate_doubles"
                  type="number"
                  step="0.001"
                  name="dupr_rate_doubles"
                  value={formData.dupr_rate_doubles}
                  onChange={handleChange}
                  placeholder="0.000"
                  style={styles.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="dupr_rate_singles" style={styles.label}>
                  DUPR Singles
                </label>
                <input
                  id="dupr_rate_singles"
                  type="number"
                  step="0.001"
                  name="dupr_rate_singles"
                  value={formData.dupr_rate_singles}
                  onChange={handleChange}
                  placeholder="0.000"
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        </section>

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => router.back()}
            style={styles.cancelButton}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={styles.saveButton}
          >
            {isSubmitting ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
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
  form: {
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
  subSectionTitle: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '16px',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
  },
  readOnlyGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '4px 0',
  },
  label: {
    display: 'block',
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '8px',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#0070f3',
  },
  requiredBadge: {
    color: '#ff4d4f',
    marginLeft: '4px',
  },
  readOnlyValue: {
    color: '#666',
    fontWeight: 500,
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
  passwordInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  passwordInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
  },
  visibilityButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '1.1rem',
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
  hr: {
    border: 'none',
    borderTop: '1px solid #333',
    margin: '24px 0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '20px',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #444',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}