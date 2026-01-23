/**
 * Filename: members/login/page.tsx
 * Version : V2.7.7
 * Update  : 2026-01-24
 * 内容：
 * V2.7.7
 * - ダークモード対応（背景：黒、文字：白）
 * - レイアウト最適化（郵便番号・緊急連絡先・DUPR ID）
 * - メモ欄を profile_memo (公開用) と admin_note (管理者用) に分離
 * V2.7.5
 * - ラインユーザとPCユーザのタイトル文字変更
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
    tel: '',         // 個人電話番号
    zip_code: '',    // 郵便番号
    address: '',     // 住所
    dupr_id: '',     // DUPR ID
    emg_tel: '',     // 緊急連絡先
    emg_rel: '',     // 続柄
    introducer: '',  // 紹介者
    profile_memo: '', // 公開用メモ
    admin_note: '',   // 管理者向けメモ(非公開)
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
      if (!currentLineId) {
        // ブラウザ版：パスワード照合
        if (existingUser.password === formData.password) {
          router.push('/members/profile')
        } else {
          alert('パスワードが正しくありません')
        }
      } else {
        // LINE版：紐付け確認へ
        setStep('link-confirm')
      }
    } else {
      // 新規登録フォームへ
      setStep('full-form')
    }
  }

  // 最終的な保存・紐付け処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      // 既存データへのLINE ID紐付け
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

  if (isLoading) return <div style={containerStyle}>読み込み中...</div>

  // タイトルの決定
  const pageTitle = currentLineId ? '登録確認' : 'ログイン / 新規登録'

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '30px' }}>{pageTitle}</h1>

      <form onSubmit={step === 'initial' ? handleNext : handleSubmit}>
        {/* --- Step 1: 共通 (メール・パスワード) --- */}
        <div style={sectionStyle}>
          <label style={labelStyle}>メールアドレス *</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            style={inputStyle} 
            disabled={step !== 'initial'} 
          />

          {(!currentLineId || step !== 'initial') && (
            <>
              <label style={labelStyle}>
                パスワード * {step === 'full-form' && '※新規登録用'}
              </label>
              <input 
                type="password" 
                required 
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })} 
                style={inputStyle} 
              />
            </>
          )}
        </div>

        {step === 'initial' && <button style={submitBtnStyle}>次へ進む</button>}

        {/* --- Step 2: 既存LINE紐付け --- */}
        {step === 'link-confirm' && (
          <div style={{ ...sectionStyle, backgroundColor: '#1a2633', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: '#88ccff' }}>
              既にPC等で登録済みのメールアドレスです。<br />パスワードを入力してLINEと連携してください。
            </p>
            <button style={submitBtnStyle}>連携してログイン</button>
          </div>
        )}

        {/* --- Step 2: 新規フルフォーム --- */}
        {step === 'full-form' && (
          <>
            <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
              <button type="button" onClick={() => setRegType('member')} style={regType === 'member' ? activeTabStyle : inactiveTabStyle}>通常会員 申請</button>
              <button type="button" onClick={() => setRegType('guest')} style={regType === 'guest' ? activeTabStyle : inactiveTabStyle}>ゲスト 申請</button>
            </div>

            <div style={sectionStyle}>
              <h3 style={headerStyle}>プロフィール情報</h3>
              <label style={labelStyle}>ニックネーム *</label>
              <input 
                type="text" 
                value={currentLineId ? lineDisplayName : formData.nickname} 
                readOnly={!!currentLineId} 
                onChange={e => setFormData({ ...formData, nickname: e.target.value })} 
                style={currentLineId ? { ...inputStyle, backgroundColor: '#333', color: '#888' } : inputStyle} 
              />

              <label style={labelStyle}>氏名 (漢字) *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>氏名 (ローマ字) *</label>
              <input type="text" required value={formData.name_roma} onChange={e => setFormData({ ...formData, name_roma: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>電話番号</label>
              <input type="tel" value={formData.tel} onChange={e => setFormData({ ...formData, tel: e.target.value })} style={inputStyle} placeholder="090-0000-0000" />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '40%' }}>
                  <label style={labelStyle}>郵便番号</label>
                  <input type="text" value={formData.zip_code} onChange={e => setFormData({ ...formData, zip_code: e.target.value })} style={inputStyle} placeholder="123-4567" />
                </div>
                <div style={{ flex: 1 }}>{/* 右側空きスペース */}</div>
              </div>

              <label style={labelStyle}>住所</label>
              <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '50%' }}>
                  <label style={labelStyle}>DUPR ID</label>
                  <input type="text" value={formData.dupr_id} onChange={e => setFormData({ ...formData, dupr_id: e.target.value })} style={inputStyle} placeholder="半角10文字" maxLength={10} />
                </div>
                <div style={{ flex: 1, padding: '30px 0', fontSize: '0.8rem', color: '#888' }}>
                  {/* Rating表示用スペース */}
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={headerStyle}>緊急連絡先・その他</h3>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>緊急連絡先電話番号 *</label>
                  <input type="tel" required value={formData.emg_tel} onChange={e => setFormData({ ...formData, emg_tel: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>続柄 *</label>
                  <input type="text" required value={formData.emg_rel} onChange={e => setFormData({ ...formData, emg_rel: e.target.value })} style={inputStyle} placeholder="例：妻、父" />
                </div>
              </div>

              {regType === 'guest' && (
                <>
                  <label style={labelStyle}>紹介者のニックネーム *</label>
                  <input type="text" required value={formData.introducer} onChange={e => setFormData({ ...formData, introducer: e.target.value })} style={inputStyle} />
                </>
              )}

              <label style={labelStyle}>自己紹介メモ (他会員に公開されます)</label>
              <textarea
                value={formData.profile_memo}
                onChange={e => setFormData({ ...formData, profile_memo: e.target.value })}
                style={{ ...inputStyle, height: '80px' }}
                placeholder="好きなプレースタイルなど"
              />

              <label style={labelStyle}>管理者への連絡事項 (非公開)</label>
              <textarea
                value={formData.admin_note}
                onChange={e => setFormData({ ...formData, admin_note: e.target.value })}
                style={{ ...inputStyle, height: '80px', border: '1px solid #442222' }}
                placeholder="運営にのみ伝わります"
              />
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

// --- ダークモード用スタイル定数 ---
const containerStyle = { minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px', boxSizing: 'border-box' as const }
const sectionStyle = { marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#111' }
const headerStyle = { fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '15px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px' }
const labelStyle = { display: 'block', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 'bold', color: '#aaa' }
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' as const }
const submitBtnStyle = { width: '100%', padding: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }
const activeTabStyle = { flex: 1, padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
const inactiveTabStyle = { flex: 1, padding: '12px', backgroundColor: '#222', color: '#888', border: 'none', borderRadius: '8px', cursor: 'pointer' }