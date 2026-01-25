/**
 * Filename: members/new/page.tsx
 * Version : V1.2.0
 * Update  : 2026-01-25
 * 内容：
 * V1.2.0
 * - useAuthCheck から lineNickname を取得し、初期値に自動セット
 * - URLパラメータから email を取得し、初期値セット ＆ readOnly 制御を実装
 * - 欠落していた「ニックネーム」入力欄を JSX に追加
 * V1.1.0
 * - 以前のlogin/page.tsxの詳細項目を完全移植、モード切替実装
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'
import { validateRegistration } from '@/utils/memberHelpers'

export default function MemberNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentLineId, lineNickname, isLoading } = useAuthCheck()

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
    profile_memo: ''
  })

  // LINE情報とURLパラメータの初期反映
  useEffect(() => {

    // 実行タイミングを確認
    console.log('[DEBUG-NEW] useEffect triggered. isLoading:', isLoading);

    if (isLoading) return

    // 1. URLからメールアドレスを取得
    const emailParam = searchParams.get('email')

    console.log('[DEBUG-NEW] emailParam from URL:', emailParam); // ここが null なら遷移元の問題

    if (emailParam) {
      setEmail(emailParam)
    }

    // 2. LINEのニックネームを初期値にセット（未入力の場合のみ）
    console.log('[DEBUG-NEW] lineNickname from hook:', lineNickname); // ここが null なら hooks の問題
    
    if (lineNickname && !formData.nickname) {
      setFormData(prev => ({ ...prev, nickname: lineNickname }))
    }
  }, [isLoading, lineNickname, searchParams])

  if (isLoading) return <div style={containerStyle}>読み込み中...</div>

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{currentLineId ? 'LINE会員登録' : '新規登録'}</h1>

      <div style={tabContainerStyle}>
        <button 
          onClick={() => setMode('member')}
          style={mode === 'member' ? activeTabStyle : inactiveTabStyle}
        >
          新規会員登録
        </button>
        <button 
          onClick={() => setMode('guest')}
          style={mode === 'guest' ? activeTabStyle : inactiveTabStyle}
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
        readOnly={!!searchParams.get('email')} // パラメータがあれば編集不可
      />
      <input 
        type="password" 
        style={inputStyle} 
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
      {/* 欠落していたニックネーム入力欄を追加 */}
      <input 
        style={inputStyle} 
        placeholder="ニックネーム" 
        aria-label="ニックネーム"
        value={formData.nickname}
        onChange={(e) => setFormData({...formData, nickname: e.target.value})}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

      <button style={submitButtonStyle}>
        {mode === 'member' ? '会員として登録する' : 'ゲストとして登録する'}
      </button>
    </div>
  )
}

// スタイル定義（V1.1.0継承＋α）
const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh'
}

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px'
}

const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px'
}

const activeTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
}

const inactiveTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#222',
  color: '#888',
  border: '1px solid #444',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
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

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '30px'
}