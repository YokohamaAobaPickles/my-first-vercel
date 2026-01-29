/**
 * Filename: src/app/members/profile/edit/page.tsx
 * Version : V2.2.2
 * Update  : 2026-01-30
 * Remarks : 
 * V2.2.2 - 修正：緊急連絡先電話と続柄を必須項目に変更。
 * V2.2.2 - 表示：新規登録画面と統一し、必須項目のラベルに赤い「*」を表示。
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { updateMemberProfile } from '@/lib/memberApi'
import { useRouter } from 'next/navigation'

export default function ProfileEditPage() {
  const { user, isLoading } = useAuthCheck()
  const router = useRouter()
  const [formData, setFormData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({ ...user })
    }
  }, [user])

  if (isLoading || !formData) {
    return <div style={styles.container}>読み込み中...</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await updateMemberProfile(user.id, formData)
      if (res.success) {
        alert('プロフィールを更新しました')
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.wrapper}>
        <h1 style={styles.title}>プロフィール編集</h1>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>基本情報 (閲覧のみ)</h2>
          <div style={styles.card}>
            <ReadOnlyRow 
              label="会員番号" 
              value={String(user.member_number).padStart(4, '0')} 
            />
            <ReadOnlyRow 
              label="氏名" 
              value={user.name} 
            />
            <ReadOnlyRow 
              label="LINE ID" 
              value={user.line_id || '(未紐付け)'} 
            />
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>編集可能項目</h2>
          <div style={styles.card}>
            <InputRow
              label="ニックネーム"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
            <InputRow
              label="郵便番号"
              name="postal"
              value={formData.postal}
              onChange={handleChange}
            />
            <InputRow
              label="住所"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <InputRow
              label="電話番号"
              name="tel"
              value={formData.tel}
              onChange={handleChange}
            />
            
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
            
            <hr style={styles.hr} />
            <h3 style={styles.subTitle}>緊急連絡先</h3>
            
            <InputRow
              label="緊急連絡先電話"
              name="emg_tel"
              value={formData.emg_tel}
              onChange={handleChange}
              required
            />
            <InputRow
              label="続柄"
              name="emg_rel"
              value={formData.emg_rel}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        <div style={styles.buttonArea}>
          <button
            type="button"
            onClick={() => router.back()}
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            style={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

const ReadOnlyRow = ({ label, value }: any) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span style={styles.readOnlyValue}>{value}</span>
  </div>
)

const InputRow = ({ label, name, value, onChange, required = false }: any) => (
  <div style={styles.inputGroup}>
    <label htmlFor={name} style={styles.label}>
      {label}
      {required && <span style={styles.requiredBadge}> *</span>}
    </label>
    <input
      id={name}
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      style={styles.input}
    />
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
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '8px',
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
  textarea: {
    width: '100%',
    height: '100px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    resize: 'none',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #333',
    margin: '24px 0',
  },
  subTitle: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '16px',
  },
  buttonArea: {
    display: 'flex',
    gap: '16px',
    marginTop: '20px',
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
}