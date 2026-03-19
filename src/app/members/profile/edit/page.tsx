/**
 * Filename: src/app/members/profile/edit/page.tsx
 * Version : V2.8.0
 * Update  : 2026-03-19
 * Remarks : 
 * V2.8.0 - 画像アップロード・プレビュー機能の統合およびUIデザインの最終反映。
 * V2.7.0 - 共通スタイル定義（style_common / style_member）への移行とデザイン統合。
 * V2.6.0 - 追加：ゲスト時のみ紹介者欄・紹介者会員番号欄をニックネーム上に表示。紹介者変更時の照合ロジック。
 * V2.5.0 - 追加：メールアドレス欄、パスワード変更欄（現在・新・確認）、表示切替ボタン。
 * V2.4.1 - 追加：公開設定(is_profile_public)のチェックボックスを追加。
 * V2.4.0 - 統合：Member型(V2.3.0)に準拠。emg_memo等の最新キー名を使用。
 * V2.4.0 - 修正：氏名(ローマ字)、DUPR ID/レートの編集機能を追加。
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  updateMemberProfile,
  updateMemberPassword,
  fetchMemberByNicknameAndMemberNumber,
  uploadProfileIcon,
  updateMemberStatus,
} from '@/lib/memberApi'
import {
  validateIconFile,
  getStatusActionConfig
} from '@/utils/memberHelpers'
import { MemberStatus } from '@/types/member'

import { useRouter } from 'next/navigation'
import {
  colors,
  container,
  card,
  spacing,
  font,
  text,
  button,
  row,
  pageHeader,
  cardInput,
} from '@/style/style_common'
import { memberPage } from '@/style/style_member'

export default function ProfileEditPage() {
  const { user, isLoading } = useAuthCheck()
  const router = useRouter()
  const [formData, setFormData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showNewPwConfirm, setShowNewPwConfirm] = useState(false)
  const [introducerMemberNumber, setIntroducerMemberNumber] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastObjectUrlRef = useRef<string>('')

  const isGuest = formData?.member_kind === 'guest'

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        // 数値項目が null の場合に input type="number" でエラーにならないよう処理
        dupr_rate_doubles: user.dupr_rate_doubles ?? '',
        dupr_rate_singles: user.dupr_rate_singles ?? '',
      })
      if (user.profile_icon_url) {
        setPreviewUrl(user.profile_icon_url)
      }
    }
  }, [user])

  useEffect(() => {
    return () => {
      const u = lastObjectUrlRef.current
      if (u && u.startsWith('blob:')) {
        URL.revokeObjectURL(u)
      }
    }
  }, [])

  if (isLoading || !formData) {
    return <div style={container}>読み込み中...</div>
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const result = validateIconFile(
      file,
      2 * 1024 * 1024,
    )
    if (!result.isValid) {
      alert(result.error || '画像の選択に失敗しました。')
      return
    }

    const prev = lastObjectUrlRef.current
    if (prev && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev)
    }

    const url = URL.createObjectURL(file)
    lastObjectUrlRef.current = url
    setPreviewUrl(url)
    setImageFile(file)
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
      let nextProfileIconUrl: string | null | undefined =
        formData.profile_icon_url

      if (imageFile) {
        const upRes = await uploadProfileIcon(
          user.id,
          imageFile,
        )
        if (!upRes.success || !upRes.data) {
          alert(
            upRes.error?.message ||
            'プロフィール画像のアップロードに失敗しました。',
          )
          return
        }
        nextProfileIconUrl = upRes.data
      }

      const { password: _pw, ...rest } = formData
      const payload: Record<string, any> = {
        ...rest,
        dupr_rate_doubles: formData.dupr_rate_doubles !== ''
          ? parseFloat(formData.dupr_rate_doubles)
          : null,
        dupr_rate_singles: formData.dupr_rate_singles !== ''
          ? parseFloat(formData.dupr_rate_singles)
          : null,
      }
      if (nextProfileIconUrl !== undefined) {
        payload.profile_icon_url = nextProfileIconUrl ?? null
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

  // ステータス変更処理
  const handleStatusChange = async (nextStatus: MemberStatus) => {
    if (!confirm(`ステータスを変更しますか？`)) return;

    setIsSubmitting(true);
    try {
      const res = await updateMemberStatus(user.id, nextStatus);
      if (res.success) {
        alert('申請を受け付けました');
        // ローカルの状態を更新して表示に反映
        setFormData((prev: any) => ({ ...prev, status: nextStatus }));
      } else {
        alert(`エラー: ${res.error?.message}`);
      }
    } catch (error) {
      alert('通信エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatMemberNumber = (num: string | number | null | undefined) => {
    return num ? String(num).padStart(4, '0') : '----'
  }

  return (
    <div style={container}>
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: 700,
          padding: spacing.lg,
          paddingBottom: 100,
        }}
      >
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>プロフィール編集</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* 1. 基本情報 (閲覧のみ) */}
          <section
            style={{
              marginBottom: spacing.lg,
            }}
          >
            <h2 style={memberPage.sectionTitle}>基本情報 (閲覧のみ)</h2>
            <div style={card}>
              <div style={row.header}>
                <span style={cardInput.label}>会員番号</span>
                <span
                  style={{
                    ...text.subtitle,
                    marginBottom: 0,
                  }}
                >
                  {formatMemberNumber(formData.member_number)}
                </span>
              </div>
              <div style={row.header}>
                <span style={cardInput.label}>氏名</span>
                <span
                  style={{
                    ...text.subtitle,
                    marginBottom: 0,
                  }}
                >
                  {formData.name}
                </span>
              </div>
              <div style={row.header}>
                <span style={cardInput.label}>LINE ID</span>
                <span
                  style={{
                    ...text.subtitle,
                    marginBottom: 0,
                  }}
                >
                  {formData.line_id || '-'}
                </span>
              </div>
              <div style={row.header}>
                <span style={cardInput.label}>生年月日</span>
                <span
                  style={{
                    ...text.subtitle,
                    marginBottom: 0,
                  }}
                >
                  {formData.birthday
                    ? new Date(formData.birthday).toLocaleDateString('ja-JP')
                    : '-'}
                </span>
              </div>
            </div>
          </section>

          {/* 1.5 パスワード変更（基本情報ブロックの生年月日の下） */}
          <section
            style={{
              marginBottom: spacing.lg,
            }}
          >
            <h2 style={memberPage.sectionTitle}>パスワード変更</h2>
            <div style={card}>
              <div style={cardInput.wrapper}>
                <label htmlFor="current_password" style={cardInput.label}>
                  現在のパスワード
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <input
                    id="current_password"
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      ...cardInput.inputWrapper,
                      flex: 1,
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{
                      ...button.base,
                      ...button.secondary,
                      padding: '0 10px',
                      minWidth: 48,
                    }}
                    aria-label={showCurrentPw ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showCurrentPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div style={cardInput.wrapper}>
                <label htmlFor="new_password" style={cardInput.label}>
                  新パスワード
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <input
                    id="new_password"
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      ...cardInput.inputWrapper,
                      flex: 1,
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{
                      ...button.base,
                      ...button.secondary,
                      padding: '0 10px',
                      minWidth: 48,
                    }}
                    aria-label={showNewPw ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div style={cardInput.wrapper}>
                <label htmlFor="new_password_confirm" style={cardInput.label}>
                  新パスワード（確認）
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <input
                    id="new_password_confirm"
                    type={showNewPwConfirm ? 'text' : 'password'}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    style={{
                      ...cardInput.inputWrapper,
                      flex: 1,
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwConfirm(!showNewPwConfirm)}
                    style={{
                      ...button.base,
                      ...button.secondary,
                      padding: '0 10px',
                      minWidth: 48,
                    }}
                    aria-label={showNewPwConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
                  >
                    {showNewPwConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 編集可能項目 */}
          <section
            style={{
              marginBottom: spacing.lg,
            }}
          >
            <h2 style={memberPage.sectionTitle}>編集可能項目</h2>
            <div style={card}>
              {isGuest && (
                <>
                  <div style={cardInput.wrapper}>
                    <label htmlFor="introducer" style={cardInput.label}>
                      紹介者
                    </label>
                    <input
                      id="introducer"
                      type="text"
                      name="introducer"
                      value={formData.introducer || ''}
                      onChange={handleChange}
                      style={cardInput.inputWrapper}
                    />
                  </div>
                  <div style={cardInput.wrapper}>
                    <label htmlFor="introducer_member_number" style={cardInput.label}>
                      紹介者会員番号
                    </label>
                    <input
                      id="introducer_member_number"
                      type="text"
                      placeholder="紹介者の会員番号を入力してください"
                      value={introducerMemberNumber}
                      onChange={(e) => setIntroducerMemberNumber(e.target.value)}
                      style={cardInput.inputWrapper}
                    />
                  </div>
                </>
              )}
              <div style={cardInput.wrapper}>
                <label htmlFor="nickname" style={cardInput.label}>
                  ニックネーム
                  <span
                    style={{
                      color: colors.status.danger,
                      marginLeft: spacing.xs,
                      fontSize: font.size.sm,
                    }}
                  >
                    *
                  </span>
                </label>
                <div
                  style={{
                    ...memberPage.iconRow,
                    gridTemplateColumns: '80px 1fr',
                    padding: 0,
                    borderBottom: 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="画像を選択"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.inputBackground,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="プレビュー"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: colors.textSub,
                          fontSize: font.size.xl,
                          lineHeight: 1,
                        }}
                      >
                        ＋
                      </span>
                    )}
                  </button>
                  <div>
                    <input
                      ref={fileInputRef}
                      aria-label="プロフィール画像"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{
                        display: 'none',
                      }}
                    />
                    <input
                      id="nickname"
                      type="text"
                      name="nickname"
                      value={formData.nickname || ''}
                      onChange={handleChange}
                      required
                      style={cardInput.inputWrapper}
                    />
                  </div>
                </div>
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="email" style={cardInput.label}>
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="name_roma" style={cardInput.label}>
                  氏名（ローマ字）
                </label>
                <input
                  id="name_roma"
                  type="text"
                  name="name_roma"
                  value={formData.name_roma || ''}
                  onChange={handleChange}
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="postal" style={cardInput.label}>
                  郵便番号
                </label>
                <input
                  id="postal"
                  type="text"
                  name="postal"
                  value={formData.postal || ''}
                  onChange={handleChange}
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="address" style={cardInput.label}>
                  住所
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="tel" style={cardInput.label}>
                  電話番号
                </label>
                <input
                  id="tel"
                  type="text"
                  name="tel"
                  value={formData.tel || ''}
                  onChange={handleChange}
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="profile_memo" style={cardInput.label}>
                  プロフィールメモ
                </label>
                <textarea
                  id="profile_memo"
                  name="profile_memo"
                  value={formData.profile_memo || ''}
                  onChange={handleChange}
                  style={{
                    ...cardInput.inputWrapper,
                    ...cardInput.textarea,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* 公開設定チェックボックス */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.md,
                  padding: `${spacing.xs}px 0`,
                }}
              >
                <input
                  id="is_profile_public"
                  type="checkbox"
                  name="is_profile_public"
                  checked={formData.is_profile_public || false}
                  onChange={handleChange}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    accentColor: colors.status.info,
                  }}
                />
                <label
                  htmlFor="is_profile_public"
                  style={{
                    ...text.subtitle,
                    marginBottom: 0,
                    cursor: 'pointer',
                  }}
                >
                  プロフィールを他会員に公開する
                </label>
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: `1px solid ${colors.border}`,
                  margin: `${spacing.lg}px 0`,
                }}
              />

              <h3
                style={{
                  ...text.subtitle,
                  fontWeight: font.weight.bold,
                  marginBottom: spacing.md,
                }}
              >
                緊急連絡先
              </h3>
              <div style={cardInput.wrapper}>
                <label htmlFor="emg_tel" style={cardInput.label}>
                  緊急連絡先電話
                  <span
                    style={{
                      color: colors.status.danger,
                      marginLeft: spacing.xs,
                      fontSize: font.size.sm,
                    }}
                  >
                    *
                  </span>
                </label>
                <input
                  id="emg_tel"
                  type="text"
                  name="emg_tel"
                  value={formData.emg_tel || ''}
                  onChange={handleChange}
                  required
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="emg_rel" style={cardInput.label}>
                  続柄
                  <span
                    style={{
                      color: colors.status.danger,
                      marginLeft: spacing.xs,
                      fontSize: font.size.sm,
                    }}
                  >
                    *
                  </span>
                </label>
                <input
                  id="emg_rel"
                  type="text"
                  name="emg_rel"
                  value={formData.emg_rel || ''}
                  onChange={handleChange}
                  required
                  style={cardInput.inputWrapper}
                />
              </div>

              <div style={cardInput.wrapper}>
                <label htmlFor="emg_memo" style={cardInput.label}>
                  緊急連絡メモ
                </label>
                <textarea
                  id="emg_memo"
                  name="emg_memo"
                  value={formData.emg_memo || ''}
                  onChange={handleChange}
                  style={{
                    ...cardInput.inputWrapper,
                    minHeight: 60,
                    resize: 'vertical',
                  }}
                />
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: `1px solid ${colors.border}`,
                  margin: `${spacing.lg}px 0`,
                }}
              />

              <h3
                style={{
                  ...text.subtitle,
                  fontWeight: font.weight.bold,
                  marginBottom: spacing.md,
                }}
              >
                競技情報 (DUPR)
              </h3>
              <div style={cardInput.wrapper}>
                <label htmlFor="dupr_id" style={cardInput.label}>
                  DUPR ID
                </label>
                <input
                  id="dupr_id"
                  type="text"
                  name="dupr_id"
                  value={formData.dupr_id || ''}
                  onChange={handleChange}
                  placeholder="例: ABCDE"
                  style={cardInput.inputWrapper}
                />
              </div>

              <div
                style={{
                  ...cardInput.wrapper,
                  display: 'flex',
                  gap: spacing.md,
                }}
              >
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <label htmlFor="dupr_rate_doubles" style={cardInput.label}>
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
                    style={cardInput.inputWrapper}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <label htmlFor="dupr_rate_singles" style={cardInput.label}>
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
                    style={cardInput.inputWrapper}
                  />
                </div>
              </div>

              {/* 3. 各種申請（保存ボタンの上に追加） */}
              <section style={{ marginBottom: spacing.lg }}>
                <h2 style={memberPage.sectionTitle}>各種申請</h2>
                <div style={memberPage.actionButtons.container}>
                  {(() => {
                    const config = getStatusActionConfig(formData.status);
                    return (
                      <>
                        {/* 休会ボタン */}
                        <button
                          type="button"
                          disabled={isSubmitting || config.suspend.disabled}
                          onClick={() => handleStatusChange(config.suspend.nextStatus as MemberStatus)}
                          style={{
                            ...button.base,
                            ...memberPage.actionButtons[config.suspend.variant],
                            flex: 1,
                            opacity: config.suspend.disabled ? 0.5 : 1,
                            cursor: config.suspend.disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {config.suspend.label}
                        </button>

                        {/* 退会ボタン */}
                        <button
                          type="button"
                          disabled={isSubmitting || config.withdraw.disabled}
                          onClick={() => handleStatusChange(config.withdraw.nextStatus as MemberStatus)}
                          style={{
                            ...button.base,
                            ...memberPage.actionButtons[config.withdraw.variant],
                            flex: 1,
                            opacity: config.withdraw.disabled ? 0.5 : 1,
                            cursor: config.withdraw.disabled ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {config.withdraw.label}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </section>
            </div>
          </section>

          <div
            style={{
              display: 'flex',
              gap: spacing.md,
              marginTop: spacing.lg,
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                ...button.base,
                ...button.secondary,
                flex: 1,
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...button.base,
                ...button.primary,
                flex: 2,
              }}
            >
              {isSubmitting ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}