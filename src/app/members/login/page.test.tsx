/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.2.0
 * Update  : 2026-01-25
 * 内容：
 * V1.2.0
 * - LINE紐付け成功時、メールアドレスをクエリパラメータで渡して遷移する検証を追加
 * V1.1.0
 * - 既に会員登録済みの場合のプロフィール画面遷移テストを追加
 * - 80文字ワードラップ、条件判定の改行を適用
 * V1.0.0
 * - ログインページの初期表示およびLINE連携フローの基本テスト作成
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

describe('MemberLoginPage (LINE紐付け遷移の検証)', () => {
  const mockPush = vi.fn()
  const TEST_LINE_ID = 'U_LOGIN_TEST_123'
  const TEST_EMAIL = 'new-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: mockPush })
  })

  it('【新規検証】LINE紐付け成功後、メールアドレスをURLに付けて新規登録画面へ遷移すること', async () => {
    // 1. LINE IDを保持しているが未登録の状態をシミュレート
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })

    // 2. Supabaseで「該当者なし」を返すよう設定
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    render(<MemberLoginPage />)

    // 3. メールアドレスを入力して「連携する」をクリック
    const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } })
    
    const submitButton = screen.getByRole('button', { name: /連携する/i })
    fireEvent.click(submitButton)

    // 4. 検証：パラメータ付きで push されているか
    // 【現状の本体 V1.1.0 では email なしの '/members/new' なので FAIL 期待】
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/members/new?email=${encodeURIComponent(TEST_EMAIL)}`)
    })
  })

  it('LINE連携済みユーザーの場合、プロフィール画面へ自動遷移すること', async () => {
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
})