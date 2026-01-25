/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.3.8
 * Update  : 2026-01-25
 * 内容：
 * V1.3.8
 * - 過去の全テスト項目（V1.2.0〜V1.3.7）を完全網羅
 * - supabase モック、URLパラメータ (?email=...) 取得、全プレースホルダー検証
 * - ゲスト登録時の紹介者欄、緊急連絡先必須マーク(*)の検証
 * - 全てのオブジェクト引数・JSXプロパティで1行1項目ルールを徹底
 */

import { 
  render, 
  screen, 
  fireEvent 
} from '@testing-library/react'
import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useSearchParams } from 'next/navigation'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')

vi.mock('next/navigation', () => ({
  useRouter: () => ({ 
    push: vi.fn(), 
    replace: vi.fn() 
  }),
  useSearchParams: vi.fn(),
}))

// Supabaseのモック（過去のテストとの互換性維持）
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}))

describe('MemberNewPage (完全版・全項目網羅 V1.3.8)', () => {
  const TEST_LINE_ID = 'U_TEST_123'
  const TEST_NICKNAME = 'ライン太郎'
  const TEST_EMAIL = 'test@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ロード中は適切なメッセージが表示されること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: true, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
  })

  it('【V1.2.0継承】URLパラメータからメールアドレスが引き継がれ、LINE環境では修正不可であること', () => {
    // クエリパラメータ email=test@example.com
    ;(useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'email' ? TEST_EMAIL : null)
    })
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: TEST_NICKNAME,
      user: null,
    })
    
    render(<MemberNewPage />)
    
    const emailInput = screen.getByLabelText(/メールアドレス/)
    expect((emailInput as any).value).toBe(TEST_EMAIL)
    expect((emailInput as any).readOnly).toBe(true)
  })

  it('【V1.3.0継承】ブラウザ環境では、ニックネームやメールが入力可能であること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    const nickInput = screen.getByLabelText(/ニックネーム/)
    const emailInput = screen.getByLabelText(/メールアドレス/)
    
    expect((nickInput as any).readOnly).toBe(false)
    expect((emailInput as any).readOnly).toBe(false)
  })

  it('【V1.2.5継承】全ての入力欄のプレースホルダーが正しく配置されていること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    expect(screen.getByPlaceholderText('山田 太郎')).toBeTruthy()
    expect(screen.getByPlaceholderText('Taro Yamada')).toBeTruthy()
    expect(screen.getByPlaceholderText('8文字以上')).toBeTruthy()
    expect(screen.getByPlaceholderText('09000000000')).toBeTruthy() // tel用
    expect(screen.getByPlaceholderText('090-0000-0000(緊急)')).toBeTruthy() // emg_tel用
    expect(screen.getByPlaceholderText('DUPR IDを入力')).toBeTruthy()
    expect(screen.getByPlaceholderText('事務局への伝達事項')).toBeTruthy()
  })

  it('【V1.2.4継承】郵便番号欄が50%幅で配置されていること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    const zipInput = screen.getByLabelText('郵便番号')
    expect((zipInput as any).style.width).toBe('50%')
  })

  it('【V1.3.5新仕様】ゲスト登録切り替え時に紹介者入力欄が表示されること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    const guestTab = screen.getByRole('button', { 
      name: 'ゲスト登録' 
    })
    fireEvent.click(guestTab)
    
    expect(screen.getByLabelText(/紹介者のニックネーム/)).toBeTruthy()
    expect(screen.getByPlaceholderText('紹介してくれた方の名前')).toBeTruthy()
  })

  it('【V1.3.5新仕様】緊急連絡先および続柄に必須マーク(*)が表示されていること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    const telLabel = screen.getByText(/緊急電話番号/)
    const relLabel = screen.getByText(/続柄/)
    
    expect(telLabel.innerHTML).toContain('*')
    expect(relLabel.innerHTML).toContain('*')
  })

  it('【エッジケース】LINE名が不在の場合でも、ページがクラッシュせず表示されること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: null,
      user: null,
    })
    
    render(<MemberNewPage />)
    
    const nickInput = screen.getByLabelText(/ニックネーム/)
    expect(nickInput).toBeTruthy()
    expect((nickInput as any).readOnly).toBe(true)
  })

  it('会員登録モードとゲスト登録モードの切り替えが正常に行えること', () => {
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    
    render(<MemberNewPage />)
    
    const guestTab = screen.getByRole('button', { 
      name: 'ゲスト登録' 
    })
    const memberTab = screen.getByRole('button', { 
      name: '新規会員登録' 
    })
    
    fireEvent.click(guestTab)
    expect(screen.getByText('紹介情報')).toBeTruthy()
    
    fireEvent.click(memberTab)
    expect(screen.queryByText('紹介情報')).toBeNull()
  })
})