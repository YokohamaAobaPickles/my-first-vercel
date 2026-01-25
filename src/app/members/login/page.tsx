/**
 * Filename: members/login/page.tsx
 * Version : V2.9.0
 * Update  : 2026-01-25
 * 内容：
 * V2.9.0
 * - ログイン機能に特化し、新規登録は /members/new へ誘導する設計に変更
 * - 80文字ワードラップ、スタイル1行記述、条件判定の改行を適用
 * V2.8.2
 * - 履歴の復元とタイポ修正
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // ログイン処理をここに実装（後ほど追加可能）
    console.log('Login attempt:', email)
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

  const secondaryBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: '1px solid #444',
    borderRadius: '30px',
    fontWeight: 'normal',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
          {currentLineId 
            ? 'LINE会員ログイン' 
            : 'ログイン / 新規登録'}
        </h1>

        <form onSubmit={handleLogin}>
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
          
          <button 
            type="submit" 
            style={primaryBtnStyle}
          >
            ログイン
          </button>
        </form>

        <div 
          style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            borderTop: '1px solid #333', 
            paddingTop: '20px' 
          }}
        >
          <p 
            style={{ 
              fontSize: '0.8rem', 
              color: '#888', 
              marginBottom: '15px' 
            }}
          >
            アカウントをお持ちでない方はこちら
          </p>
          <button
            onClick={() => router.push('/members/new')}
            style={secondaryBtnStyle}
          >
            新規登録はこちら
          </button>
        </div>
      </div>
    </div>
  )
}