/**
 * Filename: src/V1/app/login/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks :
 * V1.0.0 - V1ログインページの仕様をテストで表現。useAuthCheck / supabase / router はモック。
 */

import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'
import { supabase } from '@v1/lib/supabase'
import LoginPage from '@/app/V1/login/page'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/V1/app/login'),
}))

vi.mock('@v1/hooks/useAuthCheck')

const mockMaybeSingle = vi.fn()
const mockEqAfterUpdate = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockEqAfterUpdate }))
vi.mock('@v1/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle,
      update: mockUpdate,
    })),
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

describe('V1 ログインページ', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ replace: mockReplace })
    mockEqAfterUpdate.mockResolvedValue({ error: null })
  })

  describe('currentLineId が存在する場合（LINEアプリからのアクセス）', () => {
    test('メールで検索して見つからない場合、/V1/app/member/new にリダイレクトすること', async () => {
      ;(useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: 'LINE_USER_001',
      })
      mockMaybeSingle.mockResolvedValue({ data: null, error: null })

      render(<LoginPage />)
      const emailInput = screen.getByLabelText(/メール|email/i)
      fireEvent.change(emailInput, { target: { value: 'unknown@example.com' } })
      const submit = screen.getByRole('button', { name: /送信|ログイン|確認/i })
      fireEvent.click(submit)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/new')
      })
    })

    test('見つかり line_id が一致する場合、/V1/app/member/profile にリダイレクトすること', async () => {
      ;(useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: 'LINE_USER_001',
      })
      mockMaybeSingle.mockResolvedValue({
        data: { id: 'mem-1', email: 'a@b.com', line_id: 'LINE_USER_001' },
        error: null,
      })

      render(<LoginPage />)
      const emailInput = screen.getByLabelText(/メール|email/i)
      fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
      const submit = screen.getByRole('button', { name: /送信|ログイン|確認/i })
      fireEvent.click(submit)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/profile')
      })
    })

    test('見つかり line_id が null の場合、line_id を保存してから /V1/app/member/profile にリダイレクトすること', async () => {
      ;(useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: 'LINE_USER_002',
      })
      mockMaybeSingle.mockResolvedValue({
        data: { id: 'mem-2', email: 'c@d.com', line_id: null },
        error: null,
      })

      render(<LoginPage />)
      const emailInput = screen.getByLabelText(/メール|email/i)
      fireEvent.change(emailInput, { target: { value: 'c@d.com' } })
      const submit = screen.getByRole('button', { name: /送信|ログイン|確認/i })
      fireEvent.click(submit)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/profile')
      })
      expect(mockUpdate).toHaveBeenCalledWith({ line_id: 'LINE_USER_002' })
    })
  })

  describe('currentLineId が null の場合（ブラウザアクセス）', () => {
    test('認証成功時、/V1/app/member/profile にリダイレクトすること', async () => {
      ;(useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: null,
      })
      ;(supabase.auth.signInWithPassword as Mock).mockResolvedValue({
        data: { user: { id: 'auth-1' } },
        error: null,
      })

      render(<LoginPage />)
      fireEvent.change(screen.getByLabelText(/メール|email/i), {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/パスワード|password/i), {
        target: { value: 'pass123' },
      })
      fireEvent.click(
        screen.getByRole('button', { name: /ログイン|送信/i })
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/profile')
      })
    })

    test('認証失敗時、リダイレクトせずエラーメッセージを表示すること', async () => {
      ;(useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: null,
      })
      ;(supabase.auth.signInWithPassword as Mock).mockRejectedValue(
        new Error('Invalid login')
      )

      render(<LoginPage />)
      fireEvent.change(screen.getByLabelText(/メール|email/i), {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/パスワード|password/i), {
        target: { value: 'wrong' },
      })
      fireEvent.click(
        screen.getByRole('button', { name: /ログイン|送信/i })
      )

      await waitFor(() => {
        const alert = screen.queryByRole('alert')
        const errorText = screen.queryByText(/エラー|認証に失敗|失敗しました/i)
        expect(alert ?? errorText).toBeTruthy()
      })
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })
})
