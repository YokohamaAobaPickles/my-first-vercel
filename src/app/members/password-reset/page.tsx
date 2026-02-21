/**
 * Filename: src/app/members/password-reset/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット用メールアドレス入力画面
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordResetPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBack = () => {
    router.push('/login')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !email.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'エラーが発生しました')
        return
      }
      alert(
        '入力されたメールアドレスが登録されている場合、' +
        'パスワードリセット用のリンクをお送りしました。'
      )
      router.push('/login')
    } catch (err) {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>パスワードリセット</h1>
        <p style={styles.description}>
          登録済みのメールアドレスを入力してください。
          <br />
          パスワードリセット用のリンクをお送りします。
        </p>
        <form onSubmit={handleReset} style={styles.form}>
          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleBack}
              style={styles.backButton}
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.resetButton,
                backgroundColor: isSubmitting ? '#444' : '#0070f3',
              }}
            >
              {isSubmitting ? '送信中...' : 'リセット'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    marginBottom: '20px',
  },
  description: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginBottom: '24px',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
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
  resetButton: {
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
