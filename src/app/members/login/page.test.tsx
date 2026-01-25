/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.2.2
 * Update  : 2026-01-25
 * 内容：
 * V1.2.2
 * - Supabaseのメソッドチェーン・モックの定義を改善（既存ユーザー検知の失敗を修正）
 * - 80文字ワードラップ、条件判定の改行を適用
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'

// モックの基本構造を定義
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/supabase', () => {
  const mockSingle = vi.fn()
  const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null })
  })

  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
        update: mockUpdate,
      })),
    },
  }
})

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginPage (LINE連携フローの検証)', () => {
  const TEST_LINE_ID = 'U_TEST_LINE_999'

  beforeEach(() => {
    vi.clearAllMocks()
    // window.alertをモック化（エラー回避）
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('既存メールがない場合、新規登録画面へ遷移すること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
    })

    // select().eq().single() が null (データなし) を返すように設定
    const fromSpy = vi.spyOn(supabase, 'from')
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    } as any)

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/メールアドレスを入力/i)
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
    fireEvent.click(screen.getByText(/次へ進む/i))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/members/new?email=new%40example.com&fixed=true')
      )
    })
  })

  it('既存メールがある場合、紐付けを行いプロフィールへ遷移すること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
    })

    // 既存ユーザーを返すように設定
    const fromSpy = vi.spyOn(supabase, 'from')
    fromSpy.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 1, line_id: null }, 
        error: null 
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      }),
    } as any)

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/メールアドレスを入力/i)
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.click(screen.getByText(/次へ進む/i))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })
})