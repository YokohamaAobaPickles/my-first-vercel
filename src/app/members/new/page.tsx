/**
 * Filename: members/new/page.tsx
 * Version : V1.4.0
 * Update  : 2026-01-26
 * 内容：
 * V1.4.0
 * - 登録申請（handleSubmit）ロジックの実装
 * - 必須入力項目のバリデーション追加
 * - 送信中の多重リクエスト防止
 * V1.2.9
 * - プレースホルダーの重複を解消（テストエラー回避）
 * - 緊急電話番号の例を「(緊急用)」として区別
 * - JSXプロパティの1行1項目ルールを徹底
 */

'use client'

import React, { 
  useState, 
  useEffect, 
  Suspense 
} from 'react'
import { 
  useRouter, 
  useSearchParams 
} from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'

function MemberNewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    lineNickname, 
    currentLineId, 
    isLoading 
  } = useAuthCheck()

  const [mode, setMode] = useState<'member' | 'guest'>('member')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    name_roma: '',
    nickname: '',
    zip_code: '',
    address: '',
    tel: '',
    dupr_id: '',
    profile_memo: '',
    emg_tel: '',
    emg_rel: '',
    admin_memo: '',
    referrer_name: ''
  })

  useEffect(() => {
    if (isLoading) return
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
    if (currentLineId && lineNickname && !formData.nickname) {
      setFormData(prev => ({ 
        ...prev, 
        nickname: lineNickname 
      }))
    }
  }, [isLoading, lineNickname, currentLineId, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    // バリデーション
    const requiredFields = [
      { key: formData.name, label: '氏名（漢字）' },
      { key: formData.name_roma, label: '氏名（ローマ字）' },
      { key: password, label: 'パスワード' },
      { key: formData.emg_tel, label: '緊急電話番号' },
      { key: formData.emg_rel, label: '続柄' }
    ]

    const missing = requiredFields.find(f => !f.key)
    if (missing) {
      alert(`${missing.label}を入力してください`)
      return
    }

    if (password.length < 8) {
      alert('パスワードは8文字以上で設定してください')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('members').insert({
        ...formData,
        email,
        password,
        line_id: currentLineId || null,
        member_kind: mode === 'member' ? '正会員' : 'ゲスト',
        status: 'active',
        roles: '一般'
      })

      if (error) throw error

      alert('登録申請が完了しました')
      router.push('/members/profile')
    } catch (err) {
      console.error(err)
      alert('エラーが発生しました。時間を置いて再度お試しください。')
    } finally {
      setIsSubmitting(false)
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
      <form 
        onSubmit={handleSubmit}
      >
        <h1 
          style={titleStyle}
        >
          {currentLineId ? 'LINE会員登録' : '新規会員登録'}
        </h1>

        <div 
          style={tabContainerStyle}
        >
          <button 
            type="button"
            onClick={() => setMode('member')}
            style={mode === 'member' ? activeTabStyle : inactiveTabStyle}
          >
            新規会員登録
          </button>
          <button 
            type="button"
            onClick={() => setMode('guest')}
            style={mode === 'guest' ? activeTabStyle : inactiveTabStyle}
          >
            ゲスト登録
          </button>
        </div>

        {mode === 'guest' && (
          <>
            <div style={sectionTitleStyle}>紹介情報</div>
            <label htmlFor="referrer_name" style={labelStyle}>
              紹介者のニックネーム<span style={reqStyle}>*</span>
            </label>
            <input 
              id="referrer_name"
              style={inputStyle} 
              placeholder="紹介してくれた方の名前" 
              value={formData.referrer_name}
              onChange={(e) => setFormData({ 
                ...formData, 
                referrer_name: e.target.value 
              })} 
            />
          </>
        )}

        <div style={sectionTitleStyle}>基本情報</div>
        
        <label htmlFor="name" style={labelStyle}>
          氏名（漢字）<span style={reqStyle}>*</span>
        </label>
        <input 
          id="name"
          style={inputStyle} 
          placeholder="山田 太郎" 
          value={formData.name}
          onChange={(e) => setFormData({ 
            ...formData, 
            name: e.target.value 
          })} 
        />
        
        <label htmlFor="name_roma" style={labelStyle}>
          氏名（ローマ字）<span style={reqStyle}>*</span>
        </label>
        <input 
          id="name_roma"
          style={inputStyle} 
          placeholder="Taro Yamada" 
          value={formData.name_roma}
          onChange={(e) => setFormData({ 
            ...formData, 
            name_roma: e.target.value 
          })} 
        />

        <label htmlFor="nickname" style={labelStyle}>
          ニックネーム {currentLineId && '（修正不可）'}
        </label>
        <input 
          id="nickname"
          style={currentLineId ? readOnlyInputStyle : inputStyle} 
          value={formData.nickname}
          readOnly={!!currentLineId}
          onChange={(e) => setFormData({ 
            ...formData, 
            nickname: e.target.value 
          })}
        />

        <label htmlFor="email" style={labelStyle}>
          メールアドレス {currentLineId && '（修正不可）'}
        </label>
        <input 
          id="email"
          style={currentLineId ? readOnlyInputStyle : inputStyle} 
          value={email}
          readOnly={!!currentLineId}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" style={labelStyle}>
          パスワード<span style={reqStyle}>*</span>
        </label>
        <p style={noteStyle}>※PCログイン等で使用します</p>
        <input 
          id="password"
          type="password" 
          style={inputStyle} 
          placeholder="8文字以上" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        <div style={sectionTitleStyle}>プロフィール情報</div>
        
        <label htmlFor="zip_code" style={labelStyle}>郵便番号</label>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input 
            id="zip_code"
            style={{ ...inputStyle, width: '50%' }} 
            placeholder="000-0000" 
            value={formData.zip_code}
            onChange={(e) => setFormData({ 
              ...formData, 
              zip_code: e.target.value 
            })} 
          />
          <div style={{ width: '50%' }}></div>
        </div>

        <label htmlFor="address" style={labelStyle}>住所</label>
        <input 
          id="address" 
          style={inputStyle} 
          placeholder="住所を入力してください" 
          value={formData.address} 
          onChange={(e) => setFormData({ 
            ...formData, 
            address: e.target.value 
          })} 
        />

        <label htmlFor="tel" style={labelStyle}>電話番号</label>
        <input 
          id="tel" 
          style={inputStyle} 
          placeholder="09000000000" 
          value={formData.tel} 
          onChange={(e) => setFormData({ 
            ...formData, 
            tel: e.target.value 
          })} 
        />

        <label htmlFor="dupr_id" style={labelStyle}>DUPR ID</label>
        <input 
          id="dupr_id" 
          style={inputStyle} 
          placeholder="DUPR IDを入力" 
          value={formData.dupr_id} 
          onChange={(e) => setFormData({ 
            ...formData, 
            dupr_id: e.target.value 
          })} 
        />

        <label htmlFor="profile_memo" style={labelStyle}>自己紹介</label>
        <textarea 
          id="profile_memo" 
          style={{ ...inputStyle, height: '80px' }} 
          placeholder="自己紹介を入力してください" 
          value={formData.profile_memo} 
          onChange={(e) => setFormData({ 
            ...formData, 
            profile_memo: e.target.value 
          })} 
        />

        <div style={sectionTitleStyle}>緊急連絡情報</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label htmlFor="emg_tel" style={labelStyle}>
              緊急電話番号<span style={reqStyle}>*</span>
            </label>
            <input 
              id="emg_tel" 
              style={inputStyle} 
              placeholder="090-0000-0000(緊急)" 
              value={formData.emg_tel} 
              onChange={(e) => setFormData({ 
                ...formData, 
                emg_tel: e.target.value 
              })} 
            />
          </div>
          <div>
            <label htmlFor="emg_rel" style={labelStyle}>
              続柄<span style={reqStyle}>*</span>
            </label>
            <input 
              id="emg_rel" 
              style={inputStyle} 
              placeholder="例：夫、妻、父" 
              value={formData.emg_rel} 
              onChange={(e) => setFormData({ 
                ...formData, 
                emg_rel: e.target.value 
              })} 
            />
          </div>
        </div>

        <label htmlFor="admin_memo" style={labelStyle}>管理者向け連絡事項</label>
        <p style={noteStyle}>※他の会員には公開されません</p>
        <textarea 
          id="admin_memo" 
          style={{ ...inputStyle, height: '60px' }} 
          placeholder="事務局への伝達事項" 
          value={formData.admin_memo} 
          onChange={(e) => setFormData({ 
            ...formData, 
            admin_memo: e.target.value 
          })} 
        />

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            ...submitButtonStyle,
            backgroundColor: isSubmitting ? '#444' : '#0070f3'
          }}
        >
          {isSubmitting 
            ? '送信中...' 
            : (mode === 'member' ? '新規会員登録申請' : 'ゲスト登録申請')}
        </button>
      </form>
    </div>
  )
}

export default function MemberNewPage() {
  return (
    <Suspense fallback={<div style={containerStyle}>読み込み中...</div>}>
      <MemberNewContent />
    </Suspense>
  )
}

// --- スタイル定義（1項目1行） ---
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
  fontWeight: 'bold'
}

const inactiveTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#222',
  color: '#888',
  border: '1px solid #444',
  borderRadius: '8px'
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  borderBottom: '1px solid #333',
  paddingBottom: '8px',
  marginTop: '32px',
  marginBottom: '16px',
  color: '#0070f3',
  fontWeight: 'bold'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.9rem',
  marginBottom: '6px',
  marginTop: '12px',
  color: '#ddd'
}

const reqStyle: React.CSSProperties = {
  color: '#ff4d4f',
  marginLeft: '4px'
}

const noteStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#888',
  marginBottom: '8px'
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

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#111',
  color: '#888',
  border: '1px solid #222'
}

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '18px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  marginTop: '40px',
  cursor: 'pointer'
}