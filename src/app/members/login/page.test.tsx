/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.3.3
 * Update  : 2026-01-25
 * 内容：
 * V1.3.3
 * - 項目漏れを修正：全4件のテストケースを完全に網羅
 * - LINE連携済みユーザーの自動遷移検証を復旧
 * V1.3.2
 * - デグレ検証：LINE環境（currentLineIdあり）で新規登録リンクが出ないことを確認
 * V1.3.1
 * - toHaveAttribute エラー回避のため、getAttribute('href') 参照に変更
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberLoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

describe('MemberLoginPage (全ケース網羅・環境別検証)', () => {
  const mockPush = vi.fn()
  const TEST_LINE_ID = 'U_LOGIN_TEST_123'
  const TEST_EMAIL = 'new-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
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
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      render(<MemberLoginPage />)
      const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
      fireEvent.change(emailInput, { target: { value: TEST_EMAIL } })
      fireEvent.click(screen.getByRole('button', { name: /連携する/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/members/new?email=${encodeURIComponent(TEST_EMAIL)}`
        )
      })
    }
  )
})