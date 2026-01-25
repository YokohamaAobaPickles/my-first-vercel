/**
 * Filename: members/login/page.tsx
 * Version : V2.8.2
 * Update  : 2026-01-25
 * 内容：
 * V2.8.2
 * - 過去のすべての変更履歴（V2.3.0〜V2.7.9）をヘッダーに復元
 * - 80文字ワードラップ、スタイル1行記述、条件判定の改行を徹底
 * V2.8.1
 * - marginBotto のスペルミスを修正（Vercelビルドエラー解消）
 * V2.8.0
 * - LINE初回ユーザー向けのUIを最適化（最初はメールのみ求め、不要なパスワード欄を隠す）
 * V2.7.9
 * - LINE初回ユーザー時、自動的に step を 'full-form' へ移行するロジックを修正
 * V2.7.8
 * - 最大幅を800pxに制限（デスクトップ対応）
 * - 自己紹介メモをプロフィール情報セクションへ移動
 * V2.7.7
 * - ダークモード対応、レイアウト最適化、メモ欄の分離
 * V2.7.0
 * - ブラウザ/LINE別の開始フロー、ニックネーム自動取得対応
 * V2.4.0
 * - ゲスト対応
 * V2.3.0
 * - 新規登録・ログインの統合
 */

'use client'

import React, { useState, useEffect } from 'react'
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
  const [step, setStep] = useState<'email-only' | 'full-form'>('email-only')

  useEffect(() => {
    if (currentLineId) {
      setStep('email-only')
    }
  }, [currentLineId])

  if (isLoading) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#fff',
          backgroundColor: '#000',
          minHeight: '100vh',
        }}
      >
        読み込み中...
      </div>
    )
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('full-form')
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
    maxWidth: '800px',
  }

  const cardStyle: React.CSSProperties = {
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #333',
    borderRadius: '12px',
    backgroundColor: '#111',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#aaa',
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

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
  }

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <h1
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            marginBottom: '30px',
          }}
        >
          {currentLineId 
            ? 'LINE会員登録' 
            : 'ログイン / 新規登録'}
        </h1>

        <form onSubmit={handleNext}>
          <div style={cardStyle}>
            {/* ガイド文言の表示判定 */}
            {step === 'email-only' && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#0070f3',
                  marginBottom: '15px',
                  fontWeight: 'bold',
                }}
              >
                メールアドレスを入力してください
              </p>
            )}

            <label style={labelStyle}>メールアドレス *</label>
            <input
              type="email"
              required
              placeholder="メールアドレス"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* 表示条件の判定を1行ずつ記述 */}
            {(
              !currentLineId || 
              step === 'full-form'
            ) && (
              <>
                <label style={labelStyle}>パスワード *</label>
                <input
                  type="password"
                  required
                  placeholder="パスワード"
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            )}
          </div>

          <button 
            type="submit" 
            style={submitBtnStyle}
          >
            {step === 'email-only' 
              ? '次へ進む' 
              : '登録・ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}