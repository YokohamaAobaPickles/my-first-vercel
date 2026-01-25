/**
 * Filename: src/app/members/login/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-25
 * 内容：
 * V1.2.0
 * - 未登録時の遷移先を /members/new?email=... に変更し、情報引き継ぎを可能にする
 * - ボタンの文言を「次へ進む」から「連携する」に変更（テストと整合）
 * - 既に会員登録済みの場合は useEffect で自動遷移するロジックを強化
 * V1.1.0
 * - LINEユーザー判別ロジックを useAuthCheck に集約
 * - 80文字ワードラップ適用
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'

export default function MemberLoginPage() {
  const router = useRouter()
  const { currentLineId, user, isLoading } = useAuthCheck()
  const [email, setEmail] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  // 既に連携済み（userが存在する）場合はプロフィールへ
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/members/profile')
    }
  }, [isLoading, user, router])

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
        // 既存ユーザー：既にLINE IDがあるか確認
        if (member.line_id) {
          alert('このメールアドレスは既にLINEと連携されています。')
          router.push('/members/profile')
        } else {
          // LINE IDを紐付けて更新
          const { error: updateError } = await supabase
            .from('members')
            .update({ line_id: currentLineId })
            .eq('email', email)

          if (updateError) throw updateError
          alert('LINEとの紐付けが完了しました！')
          router.push('/members/profile')
        }
      } else {
        // 新規ユーザー：メールアドレスをパラメータに付けて登録画面へ
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

  if (isLoading) return <div style={containerStyle}>読み込み中...</div>

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h1 style={titleStyle}>LINE会員確認</h1>
        <div>
          <p style={descStyle}>
            登録状況を確認します。メールアドレスを入力してください。
          </p>
          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={handleCheckRegistration}
            disabled={isChecking}
            style={buttonStyle}
          >
            {isChecking ? '確認中...' : '連携する'}
          </button>
        </div>
      </div>
    </div>
  )
}

// スタイル定義（V1.1.0を継承）
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
  marginBottom: '20px'
}