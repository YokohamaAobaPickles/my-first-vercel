/**
 * Filename: members/login/page.tsx
 * Version : V2.9.2
 * Update  : 2026-01-25
 * 内容：
 * V2.9.2
 * - LINEユーザーの初回アクセス時、既存登録確認のためのメール入力フローを実装
 * - DBにメールが存在するかで「既存紐付け」か「新規登録」かを分岐
 * - 80文字ワードラップ、スタイル1行記述、複数条件の改行を適用
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { 
    currentLineId, 
    isLoading 
  } = useAuthCheck()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)

  if (isLoading) {
    return (
      <div 
        style={{ 
          padding: '20px', 
          color: '#fff', 
          backgroundColor: '#000', 
          minHeight: '100vh' 
        }}
      >
        読み込み中...
      </div>
    )
  }

  // LINEユーザーの既存チェック・紐付けロジック
  const handleCheckEmail = async () => {
    if (!email) return
    setChecking(true)

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, line_id')
        .eq('email', email)
        .single()

      if (data) {
        // 既存ユーザーあり
        if (!data.line_id) {
          // 未連携なら紐付け
          await supabase
            .from('members')
            .update({ line_id: currentLineId })
            .eq('id', data.id)
          
          alert('LINEとの紐付けが完了しました。')
          router.push('/members/profile')
        } else if (data.line_id === currentLineId) {
          // 既に自分と連携済み
          router.push('/members/profile')
        } else {
          alert('このメールは既に別のLINEアカウントと紐付いています。')
        }
      } else {
        // 既存ユーザーなし -> 新規登録画面へ（メール固定フラグ付き）
        router.push(
          `/members/new?email=${encodeURIComponent(email)}&fixed=true`
        )
      }
    } catch (err) {
      // PGRST116 (データなし) 等のエラー時も新規登録へ
      router.push(
        `/members/new?email=${encodeURIComponent(email)}&fixed=true`
      )
    } finally {
      setChecking(false)
    }
  }

  // --- スタイル定義 (1プロパティ1行) ---
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  }

  const innerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    boxSizing: 'border-box',
  }

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '20px',
  }

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <h1 
          style={{ 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            marginBottom: '30px' 
          }}
        >
          {currentLineId ? 'LINE会員確認' : 'ログイン / 新規登録'}
        </h1>

        {currentLineId ? (
          <div>
            <p 
              style={{ 
                fontSize: '0.85rem', 
                marginBottom: '15px', 
                color: '#aaa' 
              }}
            >
              登録状況を確認します。メールアドレスを入力してください。
            </p>
            <input
              type="email"
              placeholder="メールアドレスを入力"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              onClick={handleCheckEmail} 
              disabled={checking}
              style={primaryBtnStyle}
            >
              {checking ? '確認中...' : '次へ進む'}
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="メールアドレス"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="パスワード"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" style={primaryBtnStyle}>
              ログイン
            </button>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link 
                href="/members/new" 
                style={{ color: '#aaa', fontSize: '0.9rem' }}
              >
                新規登録はこちら
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}