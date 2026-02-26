/**
 * Filename: src/app/members/password-reset/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセットメールアドレス入力画面のテスト
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import PasswordResetPage from './page'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('PasswordResetPage', () => {
  const mockPush = vi.fn()
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    global.fetch = vi.fn()
  })

  it('メールアドレス入力欄、戻るボタン、リセットボタンが表示されること', () => {
    render(<PasswordResetPage />)
    expect(screen.getByPlaceholderText(/メールアドレスを入力/)).toBeTruthy()
    expect(screen.getByRole('button', { name: '戻る' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'リセット' })).toBeTruthy()
  })

  it('戻るボタン押下でログイン画面へ遷移すること', () => {
    render(<PasswordResetPage />)
    fireEvent.click(screen.getByRole('button', { name: '戻る' }))
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('メールアドレスが存在しない場合は何も起きずログインへ遷移すること', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<PasswordResetPage />)
    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), {
      target: { value: 'nonexistent@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'リセット' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/password-reset/request',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'nonexistent@example.com' }),
        })
      )
      expect(window.alert).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('メールアドレスが存在する場合はAPIが呼ばれメッセージ表示後ログインへ遷移すること', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<PasswordResetPage />)
    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), {
      target: { value: 'exist@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'リセット' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/password-reset/request',
        expect.any(Object)
      )
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('パスワードリセット用のリンク')
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
