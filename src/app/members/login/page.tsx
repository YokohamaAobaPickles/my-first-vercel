'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { baseStyles } from '@/types/styles/style_common'

export default function MemberLoginPage() {
  const router = useRouter()
  const { user, isLoading, currentLineId, lineNickname } = useAuthCheck()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- logout フラグクリア ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase()
      const isLine = ua.includes('line')
      if (isLine) {
        localStorage.removeItem('logout')
      } else {
        sessionStorage.removeItem('logout')
      }
    }
  }, [])

  // --- すでにログイン済みならプロフィールへ ---
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/members/profile')
    }
  }, [isLoading, user, router])

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

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

      // --- LINE ログイン ---
      if (currentLineId) {
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
        return
      }

      // --- PC / スマホブラウザログイン ---
      if (member && password && member.password === password) {
        sessionStorage.setItem('auth_member_id', member.id)
        router.replace('/members/profile')
      } else {
        alert('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      console.error('Action error:', err)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div style={baseStyles.container} />
  }

  return (
    <div style={{ ...baseStyles.container, justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px', ...baseStyles.card }}>
        <h1 style={{ textAlign: 'center', ...baseStyles.title }}>
          {currentLineId ? 'LINE会員確認' : 'ログイン'}
        </h1>

        <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '0.85rem', marginBottom: '15px', color: '#ccc' }}>
            {currentLineId
              ? '登録状況を確認します。メールアドレスを入力してください。'
              : 'メールアドレスとパスワードを入力してください。'}
          </p>

          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={baseStyles.inputBox}
          />

          {!currentLineId && (
            <input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={baseStyles.inputBox}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...baseStyles.loginButton,
              backgroundColor: isSubmitting ? '#444' : '#08A5EF',
            }}
          >
            {isSubmitting ? '処理中...' : currentLineId ? '連携する' : 'ログイン'}
          </button>

          {!currentLineId && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Link href="/members/new" style={baseStyles.link}>
                新規会員登録はこちら
              </Link>
              <div style={{ marginTop: '8px' }}>
                <Link href="/members/password-reset" style={baseStyles.link}>
                  パスワード忘却時のリセットはこちら
                </Link>
              </div>
            </div>
          )}
        </form>

        <footer style={baseStyles.copyright}>
          YAPMS V1.0.1 Copyright 2026 Yokohama Aoba Pickles
        </footer>

        {/* --- デバッグ情報 --- }
        <div style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#111',
          border: '1px dashed #555',
          borderRadius: '8px',
          color: '#0f0',
          fontFamily: 'monospace'
        }}>
          <p style={{ borderBottom: '1px solid #444', paddingBottom: '4px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            Debug Info (Development Only)
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.7rem', textAlign: 'left', lineHeight: '1.6' }}>
            <li><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</li>
            <li><strong>isLineUA:</strong> {typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('line') ? 'YES' : 'NO'}</li>
            <li><strong>currentLineId:</strong> {currentLineId || 'null'}</li>
            <li><strong>lineNickname:</strong> {lineNickname || 'null'}</li>
            <li><strong>userExists:</strong> {user ? `YES (ID: ${user.id})` : 'NO'}</li>
            <li><strong>Session ID:</strong> {typeof window !== 'undefined' ? (sessionStorage.getItem('auth_member_id') || 'null') : 'n/a'}</li>
            <li><strong>Logout Flag:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('logout') || sessionStorage.getItem('logout') || 'none') : 'n/a'}</li>
          </ul>
        </div>
        {*/}
        
      </div>
    </div>
  )
}
