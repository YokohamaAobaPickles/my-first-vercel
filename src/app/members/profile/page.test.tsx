/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V1.3.0
 * Update  : 2026-01-25
 * 修正内容：
 * V1.3.0
 * - 未登録ユーザー（currentLineIdあり/userなし）時に、
 * ログイン画面へ自動遷移することを検証するテストケースを追加
 * - 80文字ワードラップ、条件判定の改行を適用
 * V1.2.0
 * - 正常系（登録済みユーザーの表示）のテストケースを追加
 * - 不要になった「旧仕様の確認テスト」を削除
 * V1.1.1
 * - 新仕様のテストに waitFor を追加し、非同期処理完了後もエラーが出ないことを厳格に検証
 * V1.1.0
 * - useAuthCheck のモックを追加
 * - 修正後の期待値（未登録ユーザー時にエラー画面が出ないこと）のテストケースを追加
 * V1.0.0
 * - プロフィールページの初期テスト作成（現状の不具合再現用）
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './page'
import { useAuthCheck } from '../../../hooks/useAuthCheck'
import { useRouter } from 'next/navigation'

// 認証チェックとナビゲーションをモック化
vi.mock('../../../hooks/useAuthCheck')

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('ProfilePage - 最終デグレ確認', () => {
  const TEST_LINE_ID = 'U_TEST_USER_456'
  const TEST_USER = {
    name: 'テスト太郎',
    nickname: 'タロウ',
    member_number: 'M-001',
    member_kind: '正会員',
    roles: '一般',
    status: 'active',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【新仕様】未登録ユーザーの場合、ログイン画面へリダイレクトされること', async () => {
    // データ取得は完了したが、ユーザーが見つからない状態をシミュレート
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: null,
      currentLineId: TEST_LINE_ID,
    })

    render(<ProfilePage />)

    // 期待値: 
    // 1. 会員情報が見つからないエラーが出ていないこと
    // 2. ログイン画面(/members/login) へのリダイレクトが実行されること
    expect(screen.queryByText(/会員情報が見つかりませんでした/)).toBeNull()
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/members/login')
    })
  })

  it('【正常系】登録済みユーザーの場合、プロフィール情報が正しく表示されること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      currentLineId: TEST_LINE_ID,
    })

    render(<ProfilePage />)

    // 以前のバージョンで構築した表示項目の検証
    expect(screen.getByText(/テスト太郎/)).toBeTruthy()
    expect(screen.getByText(/タロウ/)).toBeTruthy()
    expect(screen.getByText(/M-001/)).toBeTruthy()
    expect(screen.getByText(/正会員/)).toBeTruthy()
    expect(screen.getByText(/有効/)).toBeTruthy()
  })
})