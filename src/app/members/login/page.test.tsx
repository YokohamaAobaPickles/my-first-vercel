/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.3.1
 * Update  : 2026-01-25
 * 内容：
 * V1.3.1
 * - toHaveAttribute エラー回避のため、 href プロパティの直接参照に変更
 * V1.3.0
 * - ブラウザ（非LINE）環境対応：パスワード入力欄とログインボタンの表示検証を追加
 * - 新規会員登録ページへの導線（リンク）の検証を追加
 * V1.2.0
 * - LINE紐付け成功時、メールアドレスをクエリパラメータで渡して遷移する検証を追加
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberLoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// モックの設定
vi.mock('@/hooks/useAuthCheck')
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}))

describe('MemberLoginPage (ブラウザ対応・LINE紐付け遷移の検証)', () => {
  const mockPush = vi.fn()
  const TEST_LINE_ID = 'U_LOGIN_TEST_123'
  const TEST_EMAIL = 'new-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
  })

  // --- 既存の検証 (V1.2.0 継承) ---
  it('【V1.2.0継承】LINE紐付け成功後、メールをURLに付けて新規登録画面へ遷移すること', 
    async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        currentLineId: TEST_LINE_ID,
        user: null,
      })

      ;(supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      render(<MemberLoginPage />)

      const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
      fireEvent.change(emailInput, { target: { value: TEST_EMAIL } })
      
      const submitButton = screen.getByRole('button', { name: /連携する/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/members/new?email=${encodeURIComponent(TEST_EMAIL)}`
        )
      })
    }
  )

  it('【V1.1.0継承】LINE連携済みユーザーの場合、プロフィール画面へ自動遷移すること', 
    async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        currentLineId: TEST_LINE_ID,
        user: { id: 'existing_user' },
      })

      render(<MemberLoginPage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/members/profile')
      })
    }
  )

  // --- 新規検証 (V1.3.0 ブラウザ対応) ---
  it('【V1.3.0新規】一般ログイン用のパスワード欄とログインボタンが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
    })

    render(<MemberLoginPage />)

    expect(screen.getByPlaceholderText(/パスワード/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeTruthy()
  })

  it('【V1.3.0新規】新規会員登録ページへのリンクが表示されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
    })

    render(<MemberLoginPage />)

    const registerLink = screen.getByText(/新規会員登録はこちら/i)
    expect(registerLink).toBeTruthy()
    
    // hrefの検証：直接 href プロパティを参照して文字列比較
    const anchor = registerLink.closest('a')
    expect(anchor?.getAttribute('href')).toBe('/members/new')
  })
})