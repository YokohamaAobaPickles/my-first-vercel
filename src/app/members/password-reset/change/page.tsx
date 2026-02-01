/**
 * Filename: src/app/members/password-reset/change/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット用パスワード変更画面（トークン検証後）
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PasswordResetChangeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setErrorMessage('トークンがありません')
      return
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `/api/password-reset/change?token=${encodeURIComponent(token)}`
        )
        const data = await res.json()
        if (data.valid) {
          setStatus('valid')
        } else {
          setStatus('invalid')
          setErrorMessage(data.error || 'トークンが無効または期限切れです')
        }
      } catch {
        setStatus('invalid')
        setErrorMessage('検証に失敗しました')
      }
    }
    validate()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== 'valid' || isSubmitting) return

    if (newPassword !== newPasswordConfirm) {
      alert('新パスワードと確認用が一致しません')
      return
    }
    if (newPassword.length < 6) {
      alert('パスワードは6文字以上で入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/password-reset/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: newPassword.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'パスワードの更新に失敗しました')
        return
      }
      alert('パスワードを変更しました。ログインしてください。')
      router.push('/members/login')
    } catch {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <p style={styles.loading}>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={styles.title}>パスワードリセット</h1>
          <p style={styles.error}>{errorMessage}</p>
          <p style={styles.description}>
            リンクの有効期限は30分です。再度リセット手続きを行ってください。
          </p>
          <button
            type="button"
            onClick={() => router.push('/members/password-reset')}
            style={styles.backButton}
          >
            パスワードリセット画面へ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>新しいパスワードを設定</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="newPassword" style={styles.label}>
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="6文字以上"
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="newPasswordConfirm" style={styles.label}>
              新しいパスワード（確認）
            </label>
            <input
              id="newPasswordConfirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </div>
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => router.push('/members/login')}
              style={styles.backButton}
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                backgroundColor: isSubmitting ? '#444' : '#0070f3',
              }}
            >
              {isSubmitting ? '更新中...' : 'パスワードを更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PasswordResetChangePage() {
  return (
    <Suspense fallback={<div style={styles.container}>読み込み中...</div>}>
      <PasswordResetChangeContent />
    </Suspense>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '24px',
  },
  description: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '20px',
    lineHeight: 1.6,
  },
  loading: {
    textAlign: 'center',
    color: '#aaa',
  },
  error: {
    color: '#ff4d4f',
    marginBottom: '16px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
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
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #444',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
}
