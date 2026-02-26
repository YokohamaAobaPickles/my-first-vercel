/**
 * Filename: src/app/V1/login/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks :
 * V1.0.0 - V1ログインページ。LINE時はメール検索、ブラウザ時はメール+パスワード認証。
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'
import { supabase } from '@v1/lib/supabase'
import {
  colors,
  container,
  card,
  cardInput,
  button,
  text,
  spacing,
  font,
} from '@v1/style/style_common'
import { loginPage } from '@v1/style/style_login'

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, currentLineId } = useAuthCheck()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isLine = currentLineId != null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSubmitting(true)
    try {
      if (isLine) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('email', email.trim())
          .maybeSingle()
        if (error) throw error
        if (!data) {
          router.replace('/V1/member/new')
          return
        }
        if (data.line_id === currentLineId) {
          router.replace('/V1/member/profile')
          return
        }
        if (data.line_id == null) {
          const { error: updateError } = await supabase
            .from('members')
            .update({ line_id: currentLineId })
            .eq('email', email.trim())
          if (updateError) throw updateError
        }
        router.replace('/V1/member/profile')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        router.replace('/V1/member/profile')
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '認証に失敗しました'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          ...container,
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
          fontSize: font.size.md,
        }}
      >
        読み込み中...
      </div>
    )
  }

  return (
    <div
      style={{
        ...container,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: spacing.lg,
        }}
      >
        <div
          style={{
            ...card,
            ...loginPage.card,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <h1
            style={{
              ...text.title,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            ログイン
          </h1>
          <p
            style={{
              ...text.subtitle,
              textAlign: 'center',
              marginBottom: spacing.lg,
            }}
          >
            メールアドレスとパスワードを入力してください。
          </p>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.md,
            }}
          >
            <div style={cardInput.wrapper}>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                aria-label="メールアドレス"
                required
                style={{
                  ...cardInput.inputWrapper,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {!isLine && (
              <div style={cardInput.wrapper}>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  aria-label="パスワード"
                  required
                  style={{
                    ...cardInput.inputWrapper,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  color: colors.status.danger,
                  fontSize: font.size.sm,
                  textAlign: 'center',
                }}
              >
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...button.base,
                ...button.primary,
                width: '100%',
                marginTop: spacing.sm,
              }}
            >
              ログイン
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: spacing.sm,
                marginTop: spacing.md,
              }}
            >
              <a
                href="/V1/member/new"
                style={{
                  ...text.link,
                  color: colors.status.info,
                  fontSize: font.size.sm,
                }}
              >
                新規会員登録はこちら
              </a>
              <a
                href="/V1/member/password-reset"
                style={{
                  ...text.link,
                  color: colors.status.info,
                  fontSize: font.size.sm,
                }}
              >
                パスワード忘却時のリセットはこちら
              </a>
            </div>
          </form>
        </div>
      </div>
      <footer
        style={{
          fontSize: font.size.xs,
          color: colors.text,
          textAlign: 'center',
          padding: spacing.lg,
        }}
      >
        YAPMS V1.0.0 Copyright 2026 Yokohama Aoba Pickles
      </footer>
    </div>
  )
}
