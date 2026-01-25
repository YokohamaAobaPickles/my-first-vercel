/**
 * Filename: app/members/login/page.test.tsx
 * Version : V1.0.2
 * Update  : 2026-01-25
 * 内容: A-01 初回LINEユーザーがエラー画面ではなく登録画面に誘導されるかを検証
 * V1.0.1: JSXエラー修正のため .tsx に変更
 * V1.0.2: useRouter のモックを追加し、コンポーネントのレンダリングを可能に修正
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

// --- モックの設定 ---

// Next.jsのナビゲーションをモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/members/login',
}))

// useAuthCheckのモック
vi.mock('@/hooks/useAuthCheck')

describe('LoginPage (A-01 検証)', () => {
  it('LINE初回ユーザー（DB未登録）の時、「会員情報が見つかりませんでした」と表示されないこと', () => {
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: 'U123456789',
      user: null,
      userRoles: null
    })

    render(<LoginPage />)

    // ここでエラーメッセージが「表示されてしまっている」ためにテストが失敗(Red)することを期待します
    const errorMessage = screen.queryByText(/会員情報が見つかりませんでした/i)
    expect(errorMessage).toBeNull()
  })

  it('LINE初回ユーザーの時、登録フォーム（または「LINE会員登録」の文字）が表示されること', () => {
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: 'U123456789',
      user: null
    })

    render(<LoginPage />)

    // 現在の不具合状態では、ここも「見つからない」で失敗する可能性があります
    expect(screen.getByText(/LINE会員登録/i)).toBeDefined()
  })
})