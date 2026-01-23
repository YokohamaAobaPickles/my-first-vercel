/**
 * Filename: members/login/page.tsx
 * Version : V2.3.0
 * Update： 2026-01-23
 * 内容：
 * V2.3.0
 * - LINEユーザおよびPCユーザの統合
 * V2.2.0
 * - 新規登録
 * - 会員番号自動付与(DBの機能)
 */

/**
 * Filename: members/login/page.tsx
 * Version : V2.3.0 (Case A & B Integrated with Tests)
 */

'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import liff from '@line/liff'
import {
  validateRegistration,
  isNicknameDuplicate,
  checkNicknameInSupabase
} from '@/utils/memberHelpers'

export default function LoginPage() {
  const router = useRouter()
  // 既存の認証チェックフックを利用（デグレ防止の要）
  const { isLoading, currentLineId } = useAuthCheck()

  const [lineDisplayName, setLineDisplayName] = useState('')
  const [isCheckingNick, setIsCheckingNick] = useState(false)
  const [nickError, setNickError] = useState('')
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    name_roma: '',
    nickname: '',
    password: '',
    tel: '',
    postal: '',
    address: '',
    emg_tel: '',
    emg_rel: '',
    dupr_id: '',
    profile_memo: '',
    is_profile_public: true
  })

  useEffect(() => {
    if (isLoading) return
    if (currentLineId) {
      liff.getProfile().then(p => setLineDisplayName(p.displayName))
    }
  }, [isLoading, currentLineId])

  // ニックネームの重複チェック（PC版のみ）
  const handleNickChange = async (val: string) => {
    setFormData({ ...formData, nickname: val })
    if (!val || currentLineId) return

    setIsCheckingNick(true)
    const isDup = await isNicknameDuplicate(val, checkNicknameInSupabase)
    if (isDup) {
      setNickError('このニックネームは既に使用されています')
    } else {
      setNickError('')
    }
    setIsCheckingNick(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. バリデーション用のデータ（req_dateは含めない）
    const submitNickname = currentLineId ? lineDisplayName : formData.nickname
    const validation = validateRegistration({
      ...formData,
      line_id: currentLineId,
      nickname: submitNickname
    })

    if (!validation.isValid || nickError) {
      alert(validation.errors.join('\n') || nickError)
      return
    }

    setSaving(true)

    // 2. DB保存用のデータ
    const { error } = await supabase.from('members').insert({
      ...formData,
      line_id: currentLineId,
      nickname: submitNickname,
      req_date: new Date().toISOString() // 保存直前に付与
    })

    if (!error) {
      router.push('/members/profile')
    } else {
      alert(`保存エラー: ${error.message}`)
      setSaving(false)
    }
  }

  if (isLoading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>会員登録申請</h1>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>
        {currentLineId ? `LINE連携中: ${lineDisplayName}` : 'PCブラウザから申請中'}
      </p>

      <form onSubmit={handleSubmit}>
        {!currentLineId && (
          <section style={sectionStyle}>
            <label style={labelStyle}>ニックネーム (ユニーク) *</label>
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={e => handleNickChange(e.target.value)}
              style={inputStyle}
            />
            {isCheckingNick && <span style={{ fontSize: '0.7rem' }}>確認中...</span>}
            {nickError && <div style={{ color: 'red', fontSize: '0.8rem' }}>{nickError}</div>}
          </section>
        )}

        <section style={sectionStyle}>
          <h3 style={headerStyle}>基本情報</h3>
          <input type="email" placeholder="メールアドレス" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="氏名 (漢字)" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="氏名 (ローマ字)" required value={formData.name_roma} onChange={e => setFormData({ ...formData, name_roma: e.target.value })} style={inputStyle} />
          <input type="password" placeholder="パスワード (6文字以上)" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
        </section>

        <section style={sectionStyle}>
          <h3 style={headerStyle}>緊急連絡先</h3>
          <input type="tel" placeholder="緊急連絡先電話番号" required value={formData.emg_tel} onChange={e => setFormData({ ...formData, emg_tel: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="続柄" required value={formData.emg_rel} onChange={e => setFormData({ ...formData, emg_rel: e.target.value })} style={inputStyle} />
        </section>

        {/* 他の項目（住所、DUPR、メモ等）は必要に応じて追加 */}

        <button type="submit" disabled={saving || !!nickError} style={submitBtnStyle}>
          {saving ? '送信中...' : '登録申請する'}
        </button>
      </form>
    </div>
  )
}

// スタイルは前回同様
const sectionStyle = { marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }
const headerStyle = { fontSize: '0.9rem', marginBottom: '10px', color: '#555' }
const labelStyle = { display: 'block', fontSize: '0.8rem', marginBottom: '5px' }
const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px' }
const submitBtnStyle = { width: '100%', padding: '15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }
