/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.5.1
 * Update  : 2026-01-28
 * Remarks : 
 * V1.5.1 - jest-dom/vitest のインポートを追加（Invalid Chai property 回避）
 * V1.5.0 - 会員基本情報19項目への対応、ニックネーム重複チェック検証追加
 */

import { 
  render, 
  screen, 
  fireEvent,
  waitFor
} from '@testing-library/react'
// マッチャー（toBeInTheDocument等）を使えるようにするために必須
import '@testing-library/jest-dom/vitest' 
import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'
import { checkNicknameExists } from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn()
    }))
  }
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null)
  })
}))

describe('MemberNewPage - 新規登録画面 業務ルール検証 V1.5.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      lineNickname: null
    })
    vi.mocked(checkNicknameExists).mockResolvedValue(false)
  })

  it('【表示】基本情報19項目に関連する主要入力欄が存在すること', () => {
    render(<MemberNewPage />)
    
    // toBeInTheDocument が動作するようになります
    expect(screen.getByLabelText(/氏名（漢字）/)).toBeInTheDocument()
    expect(screen.getByLabelText(/氏名（ローマ字）/)).toBeInTheDocument()
    expect(screen.getByLabelText(/性別/)).toBeInTheDocument()
    expect(screen.getByLabelText(/生年月日/)).toBeInTheDocument()
    expect(screen.getByLabelText(/ニックネーム/)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
    expect(screen.getByLabelText(/郵便番号/)).toBeInTheDocument()
    expect(screen.getByLabelText(/住所/)).toBeInTheDocument()
    expect(screen.getByLabelText(/緊急電話番号/)).toBeInTheDocument()
    expect(screen.getByLabelText(/プロフィールを他の会員に公開する/)).toBeInTheDocument()
  })

  it('【LINE連携】ニックネーム重複時、自動的に #2 付与で提案されること', async () => {
    vi.mocked(checkNicknameExists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: 'LINE_ID_123',
      lineNickname: 'たろう'
    })

    render(<MemberNewPage />)

    await waitFor(() => {
      const nicknameInput = screen.getByLabelText(/ニックネーム/)
      // toHaveValue が動作するようになります
      expect(nicknameInput).toHaveValue('たろう#2')
    })
  })

  it('【バリデーション】必須項目が未入力の場合、保存を中断すること', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<MemberNewPage />)
    
    const submitBtn = screen.getByRole('button', {
      name: /新規会員登録申請/
    })
    fireEvent.click(submitBtn)

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('入力してください'))
  })

  it('【正常系】正会員登録でAPIが呼ばれ、プロフィールへ遷移すること', async () => {
    const mockInsert = vi.fn().mockResolvedValue({
      error: null
    })
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert
    } as any)

    render(<MemberNewPage />)

    fireEvent.change(screen.getByLabelText(/氏名（漢字）/), {
      target: { value: '山田 太郎' }
    })
    fireEvent.change(screen.getByLabelText(/氏名（ローマ字）/), {
      target: { value: 'Taro Yamada' }
    })
    fireEvent.change(screen.getByLabelText(/ニックネーム/), {
      target: { value: 'やまだちゃん' }
    })
    fireEvent.change(screen.getByLabelText(/パスワード/), {
      target: { value: 'password123' }
    })
    fireEvent.change(screen.getByLabelText(/緊急電話番号/), {
      target: { value: '090-0000-0000' }
    })
    fireEvent.change(screen.getByLabelText(/続柄/), {
      target: { value: '本人' }
    })

    const submitBtn = screen.getByRole('button', {
      name: /新規会員登録申請/
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        name: '山田 太郎',
        member_kind: '正会員'
      }))
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

  it('【操作】ゲスト登録に切り替えると紹介者入力欄が表示されること', () => {
    render(<MemberNewPage />)
    
    const guestTab = screen.getByRole('button', {
      name: /ゲスト登録/
    })
    fireEvent.click(guestTab)

    expect(screen.getByLabelText(/紹介者のニックネーム/)).toBeInTheDocument()
  })
})