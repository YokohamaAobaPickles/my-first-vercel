/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.3.9
 * Update  : 2026-01-25
 * 内容：
 * V1.3.9
 * - ログイン照合ロジックの検証を追加（実働化したログイン機能に対応）
 * - 既存の全テストケース（LINE環境制限、自動遷移、紐付けフロー）を完全維持
 * - 1行1プロパティのルールを徹底
 * V1.3.3
 * - 項目漏れを修正：全4件のテストケースを完全に網羅
 * - LINE連携済みユーザーの自動遷移検証を復旧
 * V1.3.2
 * - デグレ検証：LINE環境（currentLineIdあり）で新規登録リンクが出ないことを確認
 * V1.3.1
 * - toHaveAttribute エラー回避のため、getAttribute('href') 参照に変更
 */

import { 
  render, 
  screen, 
  fireEvent, 
  waitFor 
} from '@testing-library/react'
import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest'
import MemberLoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}))

// window.alertのモック
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

describe('MemberLoginPage (全ケース網羅・ログイン実働検証 V1.3.9)', () => {
  const mockPush = vi.fn()
  const TEST_LINE_ID = 'U_LOGIN_TEST_123'
  const TEST_EMAIL = 'new-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ 
      push: mockPush 
    })
  })

  // 1. LINE環境での表示制限（デグレ防止）
  it('【LINE環境】新規登録リンクが表示されないこと', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    
    render(<MemberLoginPage />)
    
    const link = screen.queryByText(/新規会員登録はこちら/i)
    expect(link).toBeNull()
  })

  // 2. ブラウザ環境での項目表示
  it('【ブラウザ環境】パスワード欄、ログインボタン、新規登録リンクが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
    })
    
    render(<MemberLoginPage />)
    
    expect(screen.getByPlaceholderText(/パスワード/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeTruthy()
    
    const regLink = screen.getByText(/新規会員登録はこちら/i)
    expect(regLink.closest('a')?.getAttribute('href')).toBe('/members/new')
  })

  // 3. 連携済みユーザーの自動遷移 (V1.1.0 継承)
  it('【連携済み】プロフィール画面へ自動遷移すること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: { id: 'existing_user' },
    })
    
    render(<MemberLoginPage />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

  // 4. LINE紐付けフローとパラメータ遷移 (V1.2.0 継承)
  it('【未連携】LINE紐付け成功後、メールをURLに付けて新規登録画面へ遷移すること', 
    async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        currentLineId: TEST_LINE_ID,
        user: null,
      })
      ;(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        }),
      })

      render(<MemberLoginPage />)
      
      const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
      fireEvent.change(emailInput, { 
        target: { value: TEST_EMAIL } 
      })
      fireEvent.click(screen.getByRole('button', { 
        name: /連携する/i 
      }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/members/new?email=${encodeURIComponent(TEST_EMAIL)}`
        )
      })
    }
  )

  // 5. 【新規追加】ブラウザログイン成功時の挙動 (V1.3.9)
  it('【ブラウザ】正しい情報でログインするとプロフィールへ遷移すること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
    })
    
    const mockMember = { 
      id: 'test-id', 
      name: 'テストCCC', 
      email: 'test@ccc' 
    }
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: mockMember, 
        error: null 
      }),
    })

    render(<MemberLoginPage />)

    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), {
      target: { value: 'test@ccc' }
    })
    fireEvent.change(screen.getByPlaceholderText(/パスワードを入力/), {
      target: { value: 'test' }
    })
    fireEvent.click(screen.getByRole('button', { 
      name: 'ログイン' 
    }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

// 6. 【修正】ブラウザログイン失敗時の挙動 (V1.4.0)
  it('【ブラウザ】認証失敗時に適切なエラーアラートが出ること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
    })
    
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
    })

    render(<MemberLoginPage />)

    // メールアドレスの入力を追加（これがないとバリデーションで止まる）
    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), {
      target: { value: 'test@ccc' }
    })
    
    fireEvent.change(screen.getByPlaceholderText(/パスワードを入力/), {
      target: { value: 'wrong-pass' }
    })
    
    fireEvent.click(screen.getByRole('button', { 
      name: 'ログイン' 
    }))

    await waitFor(() => {
      // これで本来の「認証失敗」のアラートを検証できます
      expect(alertMock).toHaveBeenCalledWith('メールアドレスまたはパスワードが正しくありません')
    })
  })

  
})