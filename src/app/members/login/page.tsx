/**
 * Filename: src/app/members/login/page.tsx
 * Version : V2.0.3
 * Update  : 2026-01-31
 * Remarks : 
 * V2.0.3 - 追加：フッターにシステムバージョンとコピーライトを表示。
 * V2.0.2
 * - テストCase 6に合わせ、パスワードが空の場合もDB照合へ流し「正しくありません」を出せるように変更
 * - isInvalidのガードレールをemailのみに緩和
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function MemberLoginPage() {
  const router = useRouter()
  const { user, isLoading, currentLineId } = useAuthCheck()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/members/profile')
    }
  }, [isLoading, user, router])

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    // バリデーション：emailがない場合は即アラート
    // (PC環境でpasswordが空の場合も、ここでは止めずにDB照合後のエラーに任せる)
    if (!email) {
      alert('メールアドレスとパスワードを入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: member, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (currentLineId) {
        // --- LINE環境：紐付けフロー ---
        if (member) {
          const { error: updateError } = await supabase
            .from('members')
            .update({ line_id: currentLineId })
            .eq('id', member.id)

          if (updateError) throw updateError
          router.replace('/members/profile')
        } else {
          router.replace(`/members/new?email=${encodeURIComponent(email)}`)
        }
      } else {
        // --- PC環境：通常ログインフロー ---
        // テストCase 6(password="")やCase 5の検証に対応
        if (member && password && member.password === password) {
          sessionStorage.setItem('auth_member_id', member.id)
          router.replace('/members/profile')
        } else {
          // テストの期待値「メールアドレスまたはパスワードが正しくありません」を出す
          alert('メールアドレスまたはパスワードが正しくありません')
        }
      }
    } catch (err) {
      console.error('Action error:', err)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '30px' }}>
          {currentLineId ? 'LINE会員確認' : 'ログイン'}
        </h1>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '15px', color: '#aaa' }}>
            {currentLineId
              ? '登録状況を確認します。メールアドレスを入力してください。'
              : 'メールアドレスとパスワードを入力してください。'}
          </p>

          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          {!currentLineId && (
            <input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...buttonStyle,
              backgroundColor: isSubmitting ? '#444' : '#0070f3'
            }}
          >
            {isSubmitting ? '処理中...' : (currentLineId ? '連携する' : 'ログイン')}
          </button>

          {!currentLineId && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <a href="/members/new" style={{ color: '#0070f3', fontSize: '0.9rem', textDecoration: 'none' }}>
                新規会員登録はこちら
              </a>
              <div style={{ marginTop: '8px' }}>
                <Link href="/members/password-reset" style={passwordResetLinkStyle}>
                  パスワード忘却時のリセットはこちら
                </Link>
              </div>
            </div>
          )}
        </form>

        {/* バージョン情報・コピーライト表示 */}
        <footer style={footerStyle}>
          YAPMS V1.0.0 Copyright 2026 Yokohama Aoba Pickles
        </footer>

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  backgroundColor: '#222',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  boxSizing: 'border-box' as const,
}

const buttonStyle = {
  width: '100%',
  padding: '16px',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '10px',
  marginBottom: '20px',
}

const passwordResetLinkStyle: React.CSSProperties = {
  color: '#0070f3',
  fontSize: '0.9rem',
  textDecoration: 'none',
}

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '40px',
  fontSize: '0.7rem',
  color: '#666',
  letterSpacing: '0.05em',
}