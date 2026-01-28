/**
 * Filename: src/app/members/profile/edit/page.tsx
 * Version : V1.6.5
 * Update  : 2026-01-28
 * 内容：
 * - 連絡先・住所セクションの復元（テストエラー解消）
 * - Hooks の順序修正 (Error #310 回避)
 * - ニックネーム重複チェック、公開設定、LINEユーザー制御の統合
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { updateMemberProfile, checkNicknameExists } from '@/lib/memberApi'

export default function EditProfilePage() {
  const { user, isLoading } = useAuthCheck()
  const router = useRouter()

  // --- Hooks は必ず冒頭に ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    postal: '',
    address: '',
    tel: '',
    profile_memo: '',
    dupr_id: '',
    emg_tel: '',
    emg_rel: '',
    emg_memo: '',
    is_profile_public: true
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        postal: user.postal || '',
        address: user.address || '',
        tel: user.tel || '',
        profile_memo: user.profile_memo || '',
        dupr_id: user.dupr_id || '',
        emg_tel: user.emg_tel || '',
        emg_rel: user.emg_rel || '',
        emg_memo: user.emg_memo || '',
        is_profile_public: user.is_profile_public ?? true
      })
    }
  }, [user])

  // --- 早期リターンは Hooks の後 ---
  if (isLoading) return <div style={styles.container}>読み込み中...</div>
  if (!user) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [id]: val }))
  }

  const handleSave = async () => {
    if (!user.id) return

    if (formData.nickname !== user.nickname && formData.nickname !== '') {
      const isDup = await checkNicknameExists(formData.nickname)
      if (isDup) {
        alert('このニックネームは既に他のメンバーに使用されています。')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const res = await updateMemberProfile(user.id, formData)
      if (res.success) {
        alert('プロフィールを保存しました')
        router.push('/members/profile')
      } else {
        alert(`エラー: ${res.error?.message}`)
      }
    } catch (err) {
      alert('予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLineUser = !!user.line_id

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>プロフィール編集</h1>

        {/* 公開設定 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>公開設定</h2>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="is_profile_public"
                checked={formData.is_profile_public}
                onChange={handleChange}
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="is_profile_public" style={styles.label}>
                プロフィールを他の会員に公開する
              </label>
            </div>
          </div>
        </section>

        {/* 公開プロフィール */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>公開プロフィール</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label htmlFor="nickname" style={styles.label}>
                ニックネーム {isLineUser && '(LINE連携中は変更不可)'}
              </label>
              <input
                id="nickname"
                style={isLineUser ? styles.readOnlyInput : styles.input}
                value={formData.nickname}
                onChange={handleChange}
                readOnly={isLineUser}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="profile_memo" style={styles.label}>自己紹介</label>
              <textarea
                id="profile_memo"
                style={{ ...styles.input, height: '80px' }}
                value={formData.profile_memo}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="dupr_id" style={styles.label}>DUPR ID</label>
              <input
                id="dupr_id"
                style={styles.input}
                value={formData.dupr_id}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* 連絡先・住所 (ここを復元しました) */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>連絡先・住所</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label htmlFor="postal" style={styles.label}>郵便番号</label>
              <input
                id="postal"
                style={styles.input}
                value={formData.postal}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="address" style={styles.label}>住所</label>
              <input
                id="address"
                style={styles.input}
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="tel" style={styles.label}>電話番号</label>
              <input
                id="tel"
                style={styles.input}
                value={formData.tel}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* 緊急連絡先 */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>緊急連絡先</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label htmlFor="emg_tel" style={styles.label}>
                緊急連絡先電話番号
              </label>
              <input
                id="emg_tel"
                style={styles.input}
                value={formData.emg_tel}
                onChange={handleChange}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="emg_rel" style={styles.label}>続柄</label>
              <input
                id="emg_rel"
                style={styles.input}
                value={formData.emg_rel}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* 基本情報（変更不可） */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>基本情報（変更不可）</h2>
          <div style={styles.card}>
            {[
              { id: 'name', label: '氏名', val: user.name },
              { id: 'name_roma', label: '氏名（ローマ字）', val: user.name_roma },
              { id: 'gender', label: '性別', val: user.gender },
              { id: 'birthday', label: '生年月日', val: user.birthday },
              { id: 'member_number', label: '会員番号', val: user.member_number },
              { id: 'roles', label: 'ロール', val: user.roles }
            ].map(item => (
              <div key={item.id} style={styles.inputGroup}>
                <label htmlFor={item.id} style={styles.label}>{item.label}</label>
                <input
                  id={item.id}
                  style={styles.readOnlyInput}
                  value={item.val || ''}
                  readOnly
                />
              </div>
            ))}
          </div>
        </section>

        <div style={styles.buttonContainer}>
          <button
            onClick={() => router.push('/members/profile')}
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh'
  },
  wrapper: { width: '100%', maxWidth: '500px' },
  title: { fontSize: '1.5rem', marginBottom: '30px', textAlign: 'center' },
  section: { marginBottom: '32px' },
  sectionTitle: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '12px',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #333'
  },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#222',
    border: '1px solid #444',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  readOnlyInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#777',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'not-allowed'
  },
  buttonContainer: { display: 'flex', gap: '12px', marginTop: '40px', marginBottom: '80px' },
  saveButton: {
    flex: 2,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #444',
    cursor: 'pointer'
  }
}