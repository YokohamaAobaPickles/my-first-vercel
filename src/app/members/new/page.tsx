/**
 * Filename: members/new/page.tsx
 * Version : V1.1.0
 * Update  : 2026-01-25
 * 内容：
 * V1.1.0
 * - 以前のlogin/page.tsxの詳細項目（DUPR, 自己紹介等）を完全移植
 * - 会員/ゲストのモード切替機能を実装
 * - 80文字ワードラップ、スタイル1行記述、複数条件の改行を適用
 * V1.0.0
 * - 新規会員登録専用ページとして作成
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'
import { validateRegistration } from '@/utils/memberHelpers'

export default function MemberNewPage() {
  const router = useRouter()
  const { 
    currentLineId, 
    isLoading 
  } = useAuthCheck()

  const [mode, setMode] = useState<'member' | 'guest'>('member')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    name_roma: '',
    nickname: '',
    zip_code: '',
    address: '',
    emg_tel: '',
    emg_rel: '',
    dupr_id: '',
    profile_memo: '',
    introducer: ''
  })

  // --- スタイル定義 (1プロパティ1行) ---
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh'
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
    marginTop: '24px',
    marginBottom: '16px',
    color: '#0070f3'
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

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '30px'
  }

  const tabStyle = (
    isActive: boolean
  ): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    backgroundColor: isActive 
      ? '#0070f3' 
      : '#222',
    color: isActive 
      ? 'white' 
      : '#888',
    border: isActive 
      ? 'none' 
      : '1px solid #444',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  })

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: '#fff' }}>
        読み込み中...
      </div>
    )
  }

  const handleRegister = async () => {
    const fullData = {
      ...formData,
      email,
      password,
      line_id: currentLineId,
      status: mode
    }

    const val = validateRegistration(fullData)
    if (!val.isValid) {
      alert(val.errors.join('\n'))
      return
    }

    try {
      const { error } = await supabase.from('members').insert([
        {
          ...fullData,
          roles: 'general',
          member_kind: mode === 'member' 
            ? '正会員' 
            : 'ゲスト',
          status: 'active',
          req_date: new Date().toISOString()
        }
      ])

      if (error) throw error
      alert('登録が完了しました！')
      router.push('/members/profile')
    } catch (err: any) {
      alert('エラーが発生しました: ' + err.message)
    }
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {currentLineId 
          ? 'LINE会員登録' 
          : '新規登録'}
      </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          style={tabStyle(mode === 'member')}
          onClick={() => setMode('member')}
        >
          新規会員登録
        </button>
        <button 
          style={tabStyle(mode === 'guest')}
          onClick={() => setMode('guest')}
        >
          ゲスト登録
        </button>
      </div>

      <div style={sectionTitleStyle}>認証情報</div>
      <input
        style={inputStyle}
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={sectionTitleStyle}>基本情報</div>
      <input 
        style={inputStyle} 
        placeholder="氏名（漢字）" 
        aria-label="氏名（漢字）"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input 
        style={inputStyle} 
        placeholder="氏名（ローマ字）" 
        aria-label="氏名（ローマ字）"
        value={formData.name_roma}
        onChange={(e) => setFormData({...formData, name_roma: e.target.value})}
      />
      
      <div style={sectionTitleStyle}>プロフィール情報</div>
      <input 
        style={inputStyle} 
        placeholder="DUPR ID" 
        aria-label="DUPR ID"
        value={formData.dupr_id}
        onChange={(e) => setFormData({...formData, dupr_id: e.target.value})}
      />
      <textarea 
        style={{ ...inputStyle, height: '80px' }} 
        placeholder="自己紹介・メモ（他の会員に公開されます）" 
        aria-label="自己紹介・メモ"
        value={formData.profile_memo}
        onChange={(e) => setFormData({...formData, profile_memo: e.target.value})}
      />

      <div style={sectionTitleStyle}>緊急連絡先・住所</div>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px' 
        }}
      >
        <input 
          style={inputStyle} 
          placeholder="電話番号" 
          aria-label="電話番号"
          value={formData.emg_tel}
          onChange={(e) => setFormData({...formData, emg_tel: e.target.value})}
        />
        <input 
          style={inputStyle} 
          placeholder="続柄" 
          aria-label="続柄"
          value={formData.emg_rel}
          onChange={(e) => setFormData({...formData, emg_rel: e.target.value})}
        />
      </div>

      <button 
        style={{ 
          ...submitBtnStyle, 
          backgroundColor: mode === 'member' 
            ? '#0070f3' 
            : '#555' 
        }}
        onClick={handleRegister}
      >
        {mode === 'member' 
          ? '会員として登録する' 
          : 'ゲストとして登録する'}
      </button>
    </div>
  )
}