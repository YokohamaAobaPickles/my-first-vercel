/**
 * Filename: src/app/members/login/page.tsx
 * Version : V1.3.3
 * Update  : 2026-01-25
 * 内容：
 * V1.3.3
 * - 過去の全修正履歴を復元（V1.1.0〜V1.3.1）
 * - 一般ブラウザログインをスタブから「実働ロジック」へ変更
 * - DBの email/password を照合し、成功時に /members/profile へ遷移
 * V1.3.1
 * - デグレ修正：LINEアプリ内では新規登録リンクを非表示に
 * V1.3.0
 * - ブラウザ対応：パスワード欄、ログインボタン、新規登録リンクを追加
 * V1.2.0
 * - 未登録時の遷移先を /members/new?email=... に変更
 * V1.1.0
 * - LINEユーザー判別ロジックを useAuthCheck に集約
 */

'use client'

import React, { 
  useState, 
  useEffect 
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function MemberLoginPage() {
  const router = useRouter()
  const { 
    currentLineId, 
    user, 
    isLoading 
  } = useAuthCheck()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  // 既に連携済み（userが存在する）場合はプロフィールへ
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/members/profile')
    }
  }, [isLoading, user, router])

  // LINE連携フロー（既存：LINE IDとの紐付け）
  const handleCheckRegistration = async () => {
    if (!email) {
      alert('メールアドレスを入力してください')
      return
    }
    setIsChecking(true)
    try {
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (error) throw error

      if (member) {
        if (member.line_id) {
          alert('このメールアドレスは既にLINEと連携されています。')
          router.push('/members/profile')
        } else {
          const { error: updateError } = await supabase
            .from('members')
            .update({ 
              line_id: currentLineId 
            })
            .eq('email', email)

          if (updateError) throw updateError
          alert('LINEとの紐付けが完了しました！')
          router.push('/members/profile')
        }
      } else {
        const query = new URLSearchParams({ email }).toString()
        router.push(`/members/new?${query}`)
      }
    } catch (err) {
      console.error('Check error:', err)
      alert('エラーが発生しました。')
    } finally {
      setIsChecking(false)
    }
  }

  // 一般ブラウザ ログイン（実働：プロフィール画面への遷移を復活）
  const handleLogin = async () => {
    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください')
      return
    }
    setIsChecking(true)
    try {
      // 提供されたDBリスト（password: "test" 等）と照合
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle()

      if (error) throw error

      if (member) {
        alert(`${member.name}様、ログインしました`)
        // 以前のようにプロフィール画面へ遷移させる
        router.push('/members/profile')
      } else {
        alert('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      console.error('Login error:', err)
      alert('ログイン処理中にエラーが発生しました')
    } finally {
      setIsChecking(false)
    }
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        読み込み中...
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h1 style={titleStyle}>
          {currentLineId ? 'LINE会員確認' : 'ログイン'}
        </h1>
        
        <div style={formContentStyle}>
          <p style={descStyle}>
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

          {currentLineId ? (
            <button
              onClick={handleCheckRegistration}
              disabled={isChecking}
              style={buttonStyle}
            >
              {isChecking ? '確認中...' : '連携する'}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isChecking}
              style={buttonStyle}
            >
              {isChecking ? 'ログイン中...' : 'ログイン'}
            </button>
          )}

          {!currentLineId && (
            <div style={linkContainerStyle}>
              <Link 
                href="/members/new" 
                style={linkStyle}
              >
                新規会員登録はこちら
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- スタイル定義 ---
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#000',
  color: '#fff',
  padding: '20px',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center'
}
const formWrapperStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px'
}
const formContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}
const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '1.5rem',
  marginBottom: '30px'
}
const descStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  marginBottom: '15px',
  color: '#aaa'
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  marginBottom: '12px',
  backgroundColor: '#222',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  boxSizing: 'border-box'
}
const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '10px',
  marginBottom: '20px'
}
const linkContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '10px'
}
const linkStyle: React.CSSProperties = {
  color: '#0070f3',
  fontSize: '0.9rem',
  textDecoration: 'none'
}