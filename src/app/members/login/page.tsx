/**
 * Filename: members/login/page.tsx
 * Version : V2.7.5
 * Update： 2026-01-23
 * 内容：
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
/**
 * Filename: members/login/page.tsx
 * Version : V2.7.5
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
    tel: '',          // 個人電話番号
    zip_code: '',     // 郵便番号
    address: '',      // 住所
    dupr_id: '',      // DUPR ID
    emg_tel: '',      // 緊急連絡先
    emg_rel: '',      // 続柄
    introducer: '',   // 紹介者
    profile_memo: '', // 公開用メモ
    admin_note: '',   // 管理者向けメモ(非公開)
  })

  useEffect(() => {
    if (currentLineId) {
      liff.getProfile().then(p => {
        setLineDisplayName(p.displayName)
        setFormData(prev => ({ ...prev, nickname: p.displayName }))
      })
    }
  }, [currentLineId])

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return
    const existingUser = await getMemberByEmail(formData.email)
    if (existingUser) {
      if (!currentLineId) {
        if (existingUser.password === formData.password) {
          router.push('/members/profile')
        } else {
          alert('パスワードが正しくありません')
        }
      } else {
        setStep('link-confirm')
      }
    } else {
      setStep('full-form')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateRegistration({ ...formData, line_id: currentLineId, status: regType })
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }
    setSaving(true)

    if (step === 'link-confirm') {
      const user = await getMemberByEmail(formData.email)
      if (user?.password === formData.password) {
        await linkLineIdToMember(formData.email, currentLineId!)
        router.push('/members/profile')
      } else {
        alert('パスワードが違います')
        setSaving(false)
      }
    } else {
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

  // タイトルの決定
  const pageTitle = currentLineId ? '登録確認' : 'ログイン / 新規登録'

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '30px' }}>{pageTitle}</h1>

      <form onSubmit={step === 'initial' ? handleNext : handleSubmit}>
        {/* --- Step 1: 共通 (メール・パスワード) --- */}
        <div style={sectionStyle}>
          <label style={labelStyle}>メールアドレス *</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} disabled={step !== 'initial'} />

          {(!currentLineId || step !== 'initial') && (
            <>
              <label style={labelStyle}>パスワード * ※新規登録の場合は空白でOK</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
            </>
          )}
        </div>

        {step === 'initial' && <button style={submitBtnStyle}>次へ進む</button>}

        {/* --- Step 2: 既存LINE紐付け --- */}
        {step === 'link-confirm' && (
          <div style={{ ...sectionStyle, backgroundColor: '#f0f7ff', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem' }}>既にPC等で登録済みのメールアドレスです。<br />パスワードを入力してLINEと連携してください。</p>
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
              <input type="text" value={currentLineId ? lineDisplayName : formData.nickname} readOnly={!!currentLineId} onChange={e => setFormData({ ...formData, nickname: e.target.value })} style={currentLineId ? { ...inputStyle, backgroundColor: '#f5f5f5' } : inputStyle} />

              <label style={labelStyle}>氏名 (漢字) *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>氏名 (ローマ字) *</label>
              <input type="text" required value={formData.name_roma} onChange={e => setFormData({ ...formData, name_roma: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>電話番号</label>
              <input type="tel" value={formData.tel} onChange={e => setFormData({ ...formData, tel: e.target.value })} style={inputStyle} placeholder="090-0000-0000" />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>郵便番号</label>
                  <input type="text" value={formData.zip_code} onChange={e => setFormData({ ...formData, zip_code: e.target.value })} style={inputStyle} placeholder="123-4567" />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>住所</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <label style={labelStyle}>DUPR ID</label>
              <input type="text" value={formData.dupr_id} onChange={e => setFormData({ ...formData, dupr_id: e.target.value })} style={inputStyle} placeholder="DUPR IDをお持ちの方" />
            </div>

            <div style={sectionStyle}>
              <h3 style={headerStyle}>緊急連絡先・その他</h3>
              <label style={labelStyle}>緊急連絡先電話番号 *</label>
              <input type="tel" required value={formData.emg_tel} onChange={e => setFormData({ ...formData, emg_tel: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>緊急連絡先との続柄 *</label>
              <input type="text" required value={formData.emg_rel} onChange={e => setFormData({ ...formData, emg_rel: e.target.value })} style={inputStyle} placeholder="例：妻、父" />

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
                style={{ ...inputStyle, height: '80px', border: '1px solid #ffcccc' }}
                placeholder="運営に伝えておきたいことがあれば記入してください"
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

// スタイル定数
const sectionStyle = { marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#fff' }
const headerStyle = { fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '15px', paddingBottom: '5px', borderBottom: '1px solid #eee' }
const labelStyle = { display: 'block', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 'bold', color: '#555' }
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' as const }
const submitBtnStyle = { width: '100%', padding: '16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }
const activeTabStyle = { flex: 1, padding: '12px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
const inactiveTabStyle = { flex: 1, padding: '12px', backgroundColor: '#f0f0f0', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer' }