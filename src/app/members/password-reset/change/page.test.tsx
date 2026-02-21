/**
 * Filename: src/app/members/password-reset/change/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット変更画面のテスト
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import PasswordResetChangePage from './page'
import { useRouter, useSearchParams } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('PasswordResetChangePage', () => {
  const mockPush = vi.fn()
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    global.fetch = vi.fn()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('トークンが無効の場合エラーメッセージを表示すること', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({ token: 'invalid-token' }) as any
    )
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ valid: false, error: '無効なトークンです' }),
    } as Response)

    render(<PasswordResetChangePage />)

    await waitFor(() => {
      expect(screen.getByText('無効なトークンです')).toBeTruthy()
    })
  })

  it('トークンが期限切れの場合エラーメッセージを表示すること', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({ token: 'expired-token' }) as any
    )
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          valid: false,
          error: 'トークンの有効期限が切れています',
        }),
      } as Response)

    render(<PasswordResetChangePage />)

    await waitFor(() => {
      expect(screen.getByText('トークンの有効期限が切れています')).toBeTruthy()
    })
  })

  it('トークンが有効な場合パスワード入力フォームを表示すること', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({ token: 'valid-token' }) as any
    )
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ valid: true }),
    } as Response)

    render(<PasswordResetChangePage />)

    await waitFor(() => {
      expect(screen.getByLabelText('新しいパスワード')).toBeTruthy()
      expect(screen.getByLabelText('新しいパスワード（確認）')).toBeTruthy()
    })
  })

  it('正常時はパスワードが更新されログインへ遷移すること', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams({ token: 'valid-token' }) as any
    )
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

    render(<PasswordResetChangePage />)

    await waitFor(() => {
      expect(screen.getByLabelText('新しいパスワード')).toBeTruthy()
    })

    fireEvent.change(screen.getByLabelText('新しいパスワード'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText('新しいパスワード（確認）'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /パスワードを更新/ }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/password-reset/change',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'valid-token',
            newPassword: 'newpassword123',
          }),
        })
      )
      expect(window.alert).toHaveBeenCalledWith(
        'パスワードを変更しました。ログインしてください。'
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
