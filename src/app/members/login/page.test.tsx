/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-01-25
 * 内容：
 * V1.1.0
 * - ログイン特化型への変更に伴いテストケースを刷新
 * - 新規登録画面（/members/new）への誘導ボタンの存在確認を追加
 * - 80文字ワードラップ、条件判定の改行を適用
 * V1.0.4
 * - 詳細情報入力（ステップ2）の表示検証を追加
 * V1.0.3
 * - LINE初回ユーザー時の文言検証を追加
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

// 認証チェックとルーターのモック化
vi.mock('@/hooks/useAuthCheck')
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginPage (認証・誘導の検証)', () => {
  const TEST_LINE_ID = 'U_TEST_LOGIN'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('新規登録ボタンを押した際、/members/new へ遷移すること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
    })

    render(<LoginPage />)

    // 「新規登録はこちら」ボタンを探してクリック
    const signupBtn = screen.getByText(/新規登録はこちら/i)
    fireEvent.click(signupBtn)

    // 期待値: /members/new へ飛ばされること
    expect(mockPush).toHaveBeenCalledWith('/members/new')
  })

  it('PCブラウザ（LINE IDなし）の場合、ログインフォームが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: null,
    })

    render(<LoginPage />)

    expect(screen.getByPlaceholderText(/メールアドレス/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/パスワード/i)).toBeTruthy()
    expect(screen.getByText(/ログイン \/ 新規登録/i)).toBeTruthy()
  })
})