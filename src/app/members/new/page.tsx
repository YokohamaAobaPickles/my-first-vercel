/**
 * Filename: src/app/members/new/page.tsx
 * Version : V1.5.19
 * Update  : 2026-01-28
 * Remarks : 
 * V1.5.19 - 不具合修正：LINE連携時でも性別・生年月日・公開設定が消えないよう
 * JSXの条件分岐構造を根本から修正
 * V1.5.19 - レイアウト：緊急連絡先の1列2項目表示を維持
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
import { checkNicknameExists } from '@/lib/memberApi'

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
    gender: '未回答',
    birthday: '',
    postal: '',
    address: '',
    tel: '',
    dupr_id: '',
    profile_memo: '',
    emg_tel: '',
    emg_rel: '',
    emg_memo: '',
    admin_memo: '',
    referrer_name: '',
    is_profile_public: true
  })

  useEffect(() => {
    let isMounted = true
    const initData = async () => {
      if (isLoading) return
      
      const emailParam = searchParams.get('email')
      if (emailParam && isMounted) setEmail(emailParam)

      if (currentLineId && lineNickname && !formData.nickname) {
        let suggestedName = lineNickname
        let isDup = await checkNicknameExists(suggestedName)
        let counter = 2
        while (isDup && isMounted) {
          suggestedName = `${lineNickname}#${counter}`
          isDup = await checkNicknameExists(suggestedName)
          counter++
        }
        if (isMounted) {
          setFormData(prev => ({ 
            ...prev, 
            nickname: suggestedName 
          }))
        }
      }
    }
    initData()
    return () => { isMounted = false }
  }, [
    isLoading, 
    lineNickname, 
    currentLineId, 
    searchParams,
    formData.nickname
  ])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { 
      id, 
      value, 
      type 
    } = e.target as HTMLInputElement
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value
    setFormData(prev => ({ 
      ...prev, 
      [id]: val 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (
      !formData.name || 
      !formData.name_roma || 
      !password || 
      !formData.emg_tel
    ) {
      alert('必須項目を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const isDup = await checkNicknameExists(formData.nickname)
      if (isDup) {
        alert('このニックネームは既に使用されています。')
        setIsSubmitting(false)
        return
      }

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
      alert('エラーが発生しました。入力内容を確認してください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div style={containerStyle}>読み込み中...</div>

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit}>
        <h1 style={titleStyle}>
          {currentLineId ? 'LINE会員登録' : '新規会員登録'}
        </h1>

        <div style={tabContainerStyle}>
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
          <section style={sectionBoxStyle}>
            <div style={sectionTitleStyle}>紹介情報</div>
            <label htmlFor="referrer_name" style={labelStyle}>
              紹介者のニックネーム*
            </label>
            <input 
              id="referrer_name"
              style={inputStyle} 
              value={formData.referrer_name}
              onChange={handleChange} 
              placeholder="紹介者のニックネームを入力"
            />
          </section>
        )}

        <section style={sectionBoxStyle}>
          <div style={sectionTitleStyle}>基本情報</div>
          
          <label htmlFor="name" style={labelStyle}>氏名（漢字）*</label>
          <input 
            id="name"
            style={inputStyle} 
            value={formData.name}
            onChange={handleChange} 
            placeholder="山田 太郎"
          />
          
          <label htmlFor="name_roma" style={labelStyle}>
            氏名（ローマ字）*
          </label>
          <input 
            id="name_roma"
            style={inputStyle} 
            value={formData.name_roma}
            onChange={handleChange} 
            placeholder="Taro Yamada"
          />

          <label htmlFor="gender" style={labelStyle}>性別</label>
          <select 
            id="gender"
            style={inputStyle}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="未回答">未回答</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他">その他</option>
          </select>

          <label htmlFor="birthday" style={labelStyle}>生年月日</label>
          <input 
            id="birthday"
            type="date"
            style={inputStyle}
            value={formData.birthday}
            onChange={handleChange}
          />

          <label htmlFor="nickname" style={labelStyle}>
            ニックネーム*
          </label>
          <input 
            id="nickname"
            style={inputStyle} 
            value={formData.nickname}
            onChange={handleChange}
            placeholder="たろう"
          />

          <label htmlFor="email" style={labelStyle}>メールアドレス</label>
          <input 
            id="email"
            style={currentLineId ? readOnlyInputStyle : inputStyle} 
            value={email}
            readOnly={!!currentLineId}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
          />

          <label htmlFor="password" style={labelStyle}>
            パスワード*
          </label>
          <input 
            id="password"
            type="password" 
            style={inputStyle} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="8文字以上"
          />
        </section>

        <section style={sectionBoxStyle}>
          <div style={sectionTitleStyle}>プロフィール・連絡先</div>
          
          <div style={checkboxWrapperStyle}>
            <input 
              id="is_profile_public"
              type="checkbox"
              checked={formData.is_profile_public}
              onChange={handleChange}
              style={checkboxStyle}
            />
            <label htmlFor="is_profile_public" style={labelStyle}>
              プロフィールを他の会員に公開する
            </label>
          </div>

          <label htmlFor="postal" style={labelStyle}>郵便番号</label>
          <input 
            id="postal"
            style={inputStyle} 
            value={formData.postal}
            onChange={handleChange} 
            placeholder="123-4567"
          />

          <label htmlFor="address" style={labelStyle}>住所</label>
          <input 
            id="address" 
            style={inputStyle} 
            value={formData.address} 
            onChange={handleChange} 
          />

          <label htmlFor="tel" style={labelStyle}>電話番号</label>
          <input 
            id="tel" 
            style={inputStyle} 
            value={formData.tel} 
            onChange={handleChange} 
            placeholder="090-0000-0000"
          />

          <label htmlFor="dupr_id" style={labelStyle}>DUPR ID</label>
          <input 
            id="dupr_id" 
            style={inputStyle} 
            value={formData.dupr_id} 
            onChange={handleChange} 
          />

          <label htmlFor="profile_memo" style={labelStyle}>自己紹介</label>
          <textarea 
            id="profile_memo" 
            style={{ ...inputStyle, height: '80px' }} 
            value={formData.profile_memo} 
            onChange={handleChange} 
            placeholder="テニス歴など"
          />
        </section>

        <section style={sectionBoxStyle}>
          <div style={sectionTitleStyle}>緊急連絡情報</div>
          <div style={gridRowStyle}>
            <div>
              <label htmlFor="emg_tel" style={labelStyle}>
                緊急電話番号*
              </label>
              <input 
                id="emg_tel" 
                style={inputStyle} 
                value={formData.emg_tel} 
                onChange={handleChange} 
                placeholder="090-0000-0000"
              />
            </div>
            <div>
              <label htmlFor="emg_rel" style={labelStyle}>
                続柄*
              </label>
              <input 
                id="emg_rel" 
                style={inputStyle} 
                value={formData.emg_rel} 
                onChange={handleChange} 
                placeholder="本人・家族"
              />
            </div>
          </div>
          <label htmlFor="emg_memo" style={labelStyle}>緊急連絡先備考</label>
          <input 
            id="emg_memo" 
            style={inputStyle} 
            value={formData.emg_memo} 
            onChange={handleChange} 
          />
        </section>

        <section style={sectionBoxStyle}>
          <label htmlFor="admin_memo" style={labelStyle}>管理者向け連絡事項</label>
          <textarea 
            id="admin_memo" 
            style={{ ...inputStyle, height: '60px' }} 
            value={formData.admin_memo} 
            onChange={handleChange} 
          />
        </section>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            ...submitButtonStyle,
            backgroundColor: isSubmitting ? '#444' : '#0070f3'
          }}
        >
          {isSubmitting ? '送信中...' : '新規会員登録申請'}
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

// --- スタイル定義 ---
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
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

const sectionBoxStyle: React.CSSProperties = {
  marginBottom: '32px'
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#0070f3',
  marginBottom: '12px',
  fontWeight: 'bold',
  borderLeft: '4px solid #0070f3',
  paddingLeft: '10px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  marginBottom: '8px',
  color: '#aaa',
  marginTop: '12px'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#111',
  border: '1px solid #333',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '1rem',
  boxSizing: 'border-box'
}

const readOnlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#1a1a1a',
  color: '#666'
}

const checkboxWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '10px'
}

const checkboxStyle: React.CSSProperties = {
  width: '20px',
  height: '20px'
}

const gridRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  boxSizing: 'border-box'
}

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '30px',
  color: '#fff',
  border: 'none',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  cursor: 'pointer',
  marginBottom: '80px'
}