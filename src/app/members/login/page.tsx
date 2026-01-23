/**
 * Filename: members/login/page.tsx
 * Version : V2.4.0
 * Update： 2026-01-23
 * 内容：
 * Version : V2.7.0
 * 変更点:
 * V2.7.0
 * - ブラウザ: メアド+パスワードで開始。未登録ならそのまま追加項目表示。
 * - LINE: メアドで開始。既存ならパスワードで紐付け、新規なら全項目入力。
 * - ニックネーム: LINE時は自動取得&固定、ブラウザ時は手入力必須。
 * V2.4.0
 * - ゲスト対応
 * V2.3.0
 * - LINEユーザおよびPCユーザの統合
 * V2.2.0
 * - 新規登録
 * - 会員番号自動付与(DBの機能)
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import liff from '@line/liff'
import {
  validateRegistration,
  getMemberByEmail,
  linkLineIdToMember
} from '@/utils/memberHelpers'

type FlowStep = 'initial' | 'full-form' | 'link-confirm'

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, currentLineId } = useAuthCheck()
  
  const [step, setStep] = useState<FlowStep>('initial')
  const [lineDisplayName, setLineDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [regType, setRegType] = useState<'member' | 'guest'>('member')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    name_roma: '',
    nickname: '',
    emg_tel: '',
    emg_rel: '',
    introducer: '',
  })

  // LINEプロフィールの取得
  useEffect(() => {
    if (currentLineId) {
      liff.getProfile().then(p => {
        setLineDisplayName(p.displayName)
        setFormData(prev => ({ ...prev, nickname: p.displayName }))
      })
    }
  }, [currentLineId])

  // 「次へ」ボタン押下時の判定ロジック
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return

    const existingUser = await getMemberByEmail(formData.email)

    if (existingUser) {
      // --- ケース：既存ユーザー発見 ---
      if (!currentLineId) {
        // ブラウザ版：そのままログイン試行（パスワード照合）
        if (existingUser.password === formData.password) {
          router.push('/members/profile')
        } else {
          alert('パスワードが正しくありません')
        }
      } else {
        // LINE版：既存データがあるなら「紐付けステップ」へ
        setStep('link-confirm')
      }
    } else {
      // --- ケース：新規ユーザー ---
      setStep('full-form')
    }
  }

  // 最終的な保存・紐付け処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション (V2.4.0準拠)
    const validation = validateRegistration({
      ...formData,
      line_id: currentLineId,
      status: regType
    })

    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    setSaving(true)

    if (step === 'link-confirm') {
      // 既存データへのLINE ID紐付け (UPDATE)
      const user = await getMemberByEmail(formData.email)
      if (user?.password === formData.password) {
        await linkLineIdToMember(formData.email, currentLineId!)
        router.push('/members/profile')
      } else {
        alert('パスワードが違います')
        setSaving(false)
      }
    } else {
      // 新規登録 (INSERT)
      const { error } = await supabase.from('members').insert({
        ...formData,
        line_id: currentLineId,
        status: regType,
        req_date: new Date().toISOString()
      })

      if (!error) {
        router.push('/members/profile')
      } else {
        alert(`エラー: ${error.message}`)
        setSaving(false)
      }
    }
  }

  if (isLoading) return <div>読み込み中...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>{step === 'initial' ? 'ログイン / 新規登録' : '追加情報入力'}</h1>

      <form onSubmit={step === 'initial' ? handleNext : handleSubmit}>
        {/* --- Step 1: 共通入力 --- */}
        <div style={sectionStyle}>
          <label style={labelStyle}>メールアドレス</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            style={inputStyle} 
            disabled={step !== 'initial'}
          />
          
          {/* ブラウザ版なら最初からパスワードも出す */}
          {(!currentLineId || step === 'link-confirm' || step === 'full-form') && (
            <>
              <label style={labelStyle}>パスワード</label>
              <input 
                type="password" 
                required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={inputStyle} 
              />
            </>
          )}
        </div>

        {step === 'initial' && <button style={submitBtnStyle}>次へ</button>}

        {/* --- Step 2: 紐付け確認 (LINEのみ) --- */}
        {step === 'link-confirm' && (
          <div style={{...sectionStyle, backgroundColor: '#eefaff'}}>
            <p>既に登録されているメールアドレスです。パスワードを入力してLINEと連携してください。</p>
            <button style={submitBtnStyle}>連携してログイン</button>
          </div>
        )}

        {/* --- Step 2: 新規登録用追加フォーム --- */}
        {step === 'full-form' && (
          <>
            <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
              <button type="button" onClick={() => setRegType('member')} style={regType === 'member' ? activeTabStyle : inactiveTabStyle}>通常会員</button>
              <button type="button" onClick={() => setRegType('guest')} style={regType === 'guest' ? activeTabStyle : inactiveTabStyle}>ゲスト</button>
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>ニックネーム</label>
              <input 
                type="text" 
                value={currentLineId ? lineDisplayName : formData.nickname} 
                readOnly={!!currentLineId}
                onChange={e => setFormData({...formData, nickname: e.target.value})}
                placeholder={currentLineId ? "" : "ニックネームを入力"}
                style={currentLineId ? {...inputStyle, backgroundColor: '#eee'} : inputStyle}
              />
            </div>

            <div style={sectionStyle}>
              <h3 style={headerStyle}>基本情報</h3>
              <input type="text" placeholder="氏名 (漢字) *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="氏名 (ローマ字) *" required value={formData.name_roma} onChange={e => setFormData({...formData, name_roma: e.target.value})} style={inputStyle} />
              <input type="tel" placeholder="緊急連絡先電話番号 *" required value={formData.emg_tel} onChange={e => setFormData({...formData, emg_tel: e.target.value})} style={inputStyle} />
              <input type="text" placeholder="緊急連絡先との続柄 *" required value={formData.emg_rel} onChange={e => setFormData({...formData, emg_rel: e.target.value})} style={inputStyle} />
              
              {regType === 'guest' && (
                <input type="text" placeholder="紹介者のニックネーム *" required value={formData.introducer} onChange={e => setFormData({...formData, introducer: e.target.value})} style={inputStyle} />
              )}
            </div>

            <button disabled={saving} style={submitBtnStyle}>
              {saving ? '処理中...' : '登録申請を送信する'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

// スタイル（以前のものを踏襲）
const sectionStyle = { marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }
const headerStyle = { fontSize: '0.9rem', marginBottom: '12px', color: '#444' }
const labelStyle = { display: 'block', fontSize: '0.8rem', marginBottom: '5px', color: '#666' }
const inputStyle = { width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '5px' }
const submitBtnStyle = { width: '100%', padding: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold' }
const activeTabStyle = { flex: 1, padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }
const inactiveTabStyle = { flex: 1, padding: '12px', backgroundColor: '#e0e0e0', color: '#666', border: 'none', borderRadius: '5px' }