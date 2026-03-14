/**
 * Filename: src/app/login/page.tsx
 * Version : V1.5.3
 * Update  : 2026-03-14
 * Remarks : 
 * V1.5.3 - テストケース6(未入力/認証失敗)パスのためバリデーションをJS側に集約。
 * V1.5.2 - V1.1.1のロジック（LINE時のパスワード不要）を継承。
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { 
  colors, 
  container, 
  card, 
  spacing, 
  font, 
  button, 
  pageHeader,
  cardInput,
  text
} from '@/style/style_common'

export default function MemberLoginPage() {
  const router = useRouter()
  const { user, isLoading, currentLineId } = useAuthCheck()
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

    // テストケースに合わせ、JS側でバリデーション
    if (!email || (!currentLineId && !password)) {
      alert('メールアドレスまたはパスワードが正しくありません')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: member, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.trim())
        .maybeSingle()

      if (fetchError) throw fetchError

      // --- LINE ログイン / 連携ロジック ---
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
      if (
        member &&
        password &&
        member.password === password
      ) {
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
    return (
      <div style={{ ...container, justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: colors.textSub }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <div style={{
      ...container,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    }}>
      <div style={{ maxWidth: 400, width: '100%', marginBottom: 100 }}>
        
        <div style={{ 
          ...pageHeader.container, 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 4, 
          marginBottom: spacing.lg 
        }}>
          <h1 style={{ ...pageHeader.title, fontSize: 24 }}>
            {currentLineId ? 'LINE会員確認' : 'ログイン'}
          </h1>
          <p style={{ color: colors.textSub, fontSize: font.size.sm }}>
            Yokohama Aoba Pickles Member System<br />
          </p>
        </div>

        <div style={card}>
          <form onSubmit={handleAction} noValidate>
            <p style={{
              fontSize: '0.85rem',
              marginBottom: spacing.md,
              color: colors.textSub,
              textAlign: 'center'
            }}>
              {currentLineId
                ? '登録状況を確認します。メールアドレスを入力してください。'
                : 'メールアドレスとパスワードを入力してください。'}
            </p>

            <div style={cardInput.wrapper}>
              <label style={cardInput.label}>メールアドレス</label>
              <input
                type="email"
                placeholder="メールアドレスを入力"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...cardInput.inputWrapper, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {!currentLineId && (
              <div style={cardInput.wrapper}>
                <label style={cardInput.label}>パスワード</label>
                <input
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...cardInput.inputWrapper, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...button.base,
                backgroundColor: isSubmitting ? '#444' : '#08A5EF',
                color: colors.text,
                width: '100%',
                marginTop: spacing.sm,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '処理中...' : currentLineId ? '連携する' : 'ログイン'}
            </button>
          </form>
        </div>

        {!currentLineId && (
          <div style={{ marginTop: spacing.lg, textAlign: 'center', fontSize: font.size.sm }}>
            <p style={{ marginBottom: spacing.sm }}>
              <Link href="/members/new" style={{ ...text.link, color: colors.status.info }}>
                新規会員登録はこちら
              </Link>
            </p>
            <p>
              <Link href="/members/password-reset" style={text.linkSubtle}>
                パスワード忘却時のリセットはこちら
              </Link>
            </p>
          </div>
        )}

        <footer style={{ 
          marginTop: 32, // spacing.xl の代わり
          textAlign: 'center', 
          fontSize: '0.7rem', 
          color: colors.textSub,
          opacity: 0.6
        }}>
          YAPMS V1.0.1 Copyright 2026 Yokohama Aoba Pickles
        </footer>
      </div>
    </div>
  )
}