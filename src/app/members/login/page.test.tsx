/**
 * Filename: app/members/login/page.test.tsx
 * Version : V1.0.3
 * Update  : 2026-01-25
 * 内容:
 * V1.0.3
 * - LINEからの遷移時（currentLineIdあり）、初期状態でメール入力フォームが表示されることを検証
 * V1.0.2
 * - useRouter のモックを追加し、コンポーネントのレンダリングを可能に修正
 * V1.0.1
 * - JSXエラー修正のため .tsx に変更
 * V1.0.0
 * - A-01 初回LINEユーザーがエラー画面ではなく登録画面に誘導されるかを検証
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

// --- モックの設定 ---

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/members/login',
}))

vi.mock('@/hooks/useAuthCheck')

describe('LoginPage (A-01: LINEユーザー遷移検証)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('LINE初回ユーザー（DB未登録）時、メール入力画面が初期表示されること', () => {
    // LINE ID を持っているが、まだ会員情報は取得できていない状態を再現
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: 'U123456789',
      user: null,
      userRoles: null
    })

    render(<LoginPage />)

    // 検証ポイント：
    // 1. 「LINE会員登録」または「メールアドレスを入力してください」といった文言が出ているか
    // 2. パスワード入力欄が（このステップでは）まだ出ていないこと
    expect(screen.getByText(/メールアドレスを入力してください/i)).toBeTruthy()
    expect(screen.queryByLabelText(/パスワード/i)).toBeNull()
  })

  it('PCブラウザアクセス時、メールとパスワードの両方の入力欄が表示されること', () => {
    // LINE ID がない（外部ブラウザ）状態を再現
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
      userRoles: null
    })

    render(<LoginPage />)

    // 検証ポイント：
    // PC版は最初からログイン（メアド＋パスワード）を求める
    expect(screen.getByPlaceholderText(/メールアドレス/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/パスワード/i)).toBeTruthy()
  })
})