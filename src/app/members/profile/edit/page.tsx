/**
 * Filename: src/app/members/profile/edit/page.tsx
 * Version : V2.3.0
 * Update  : 2026-01-31
 * Remarks : 
 * V2.3.0 - 追加：DUPR Doubles/Singles レートの手動入力フィールドを追加。
 * V2.3.0 - 修正：保存時にレートを数値型に変換して API に送信。
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
      // 数値項目を適切に変換して送信
      const payload = {
        ...formData,
        dupr_rate_doubles: formData.dupr_rate_doubles 
          ? parseFloat(formData.dupr_rate_doubles) 
          : null,
        dupr_rate_singles: formData.dupr_rate_singles 
          ? parseFloat(formData.dupr_rate_singles) 
          : null
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
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const formatMemberNumber = (num: string | number) => {
    return String(num).padStart(4, '0')
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>プロフィール編集</h1>

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
              <span style={styles.readOnlyValue}>{formData.line_id}</span>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>編集可能項目</h2>
          <div style={styles.card}>
            <div style={styles.inputGroup}>
              <label htmlFor="nickname" style={styles.label}>
                ニックネーム
                <span style={styles.requiredBadge}>*</span>
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

            {/* DUPR情報 セクション */}
            <div style={styles.inputGroup}>
              <label htmlFor="dupr_id" style={styles.label}>DUPR ID</label>
              <input
                id="dupr_id"
                type="text"
                name="dupr_id"
                value={formData.dupr_id || ''}
                onChange={handleChange}
                placeholder="例: WKRV2Q"
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
                  value={formData.dupr_rate_doubles || ''}
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
                  value={formData.dupr_rate_singles || ''}
                  onChange={handleChange}
                  placeholder="0.000"
                  style={styles.input}
                />
              </div>
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

            <hr style={styles.hr} />

            <h3 style={styles.subSectionTitle}>緊急連絡先</h3>
            <div style={styles.inputGroup}>
              <label htmlFor="emg_tel" style={styles.label}>
                緊急連絡先電話
                <span style={styles.requiredBadge}>*</span>
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
                続柄
                <span style={styles.requiredBadge}>*</span>
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