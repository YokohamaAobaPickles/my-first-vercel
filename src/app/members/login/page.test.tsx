/**
 * Filename: src/app/members/login/page.test.tsx
 * Version : V1.4.2
 * Update  : 2026-01-26
 * 修正内容：
 * V1.4.2
 * - LINE紐付け時にDB(update)が正しく呼ばれたかの検証コードを追加
 * - TypeScriptの型エラーを解消するため vi.mocked を導入
 * - 司令塔(app/page.tsx)の設計に合わせ、遷移の期待値を push から replace に変更
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberLoginPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}))

// window.alertのモック
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

describe('MemberLoginPage (交通整理・紐付けロジック検証 V1.4.2)', () => {
  const mockReplace = vi.fn()
  const TEST_LINE_ID = 'U_LOGIN_TEST_123'
  const TEST_EMAIL = 'user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ 
      replace: mockReplace 
    } as any)
  })

  // 1. LINE環境での表示制限
  it('【LINE環境】新規登録リンクが表示されないこと', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
      userRoles: null,
      lineNickname: null,
    })
    
    render(<MemberLoginPage />)
    
    const link = screen.queryByText(/新規会員登録はこちら/i)
    expect(link).toBeNull()
  })

  // 2. ブラウザ環境での項目表示
  it('【ブラウザ環境】パスワード欄、ログインボタン、新規登録リンクが表示されること', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
      userRoles: null,
      lineNickname: null,
    })
    
    render(<MemberLoginPage />)
    
    expect(screen.getByPlaceholderText(/パスワード/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeTruthy()
    expect(screen.getByText(/新規会員登録はこちら/i)).toBeTruthy()
  })

  // 3. 連携済みユーザーの自動遷移
  it('【連携済み】プロフィール画面へ自動遷移すること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: { id: 'existing_user' },
      userRoles: 'member',
      lineNickname: 'TestUser',
    })
    
    render(<MemberLoginPage />)
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/members/profile')
    })
  })

  // 4. LINE紐付けフロー（DBに既存メールがある場合）
  it('【未連携】既存メールでログイン時、LINE IDを紐付けてプロフィールへ遷移すること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
      userRoles: null,
      lineNickname: null,
    })

    // Supabaseの挙動を詳細にモック
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: { id: 'uuid-123', email: TEST_EMAIL }, 
        error: null 
      }),
      update: mockUpdate,
    } as any)

    render(<MemberLoginPage />)
    
    const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } })
    
    // LINE環境ではボタン名が「連携する」に変わる仕様を想定
    fireEvent.click(screen.getByRole('button', { name: /連携する/i }))

    await waitFor(() => {
      // DBの更新が正しい引数で呼ばれたか
      expect(mockUpdate).toHaveBeenCalledWith({ line_id: TEST_LINE_ID })
      // プロフィール画面へ遷移したか
      expect(mockReplace).toHaveBeenCalledWith('/members/profile')
    })
  })

  // 5. ブラウザログイン成功時の挙動
  it('【ブラウザ】正しい情報でログインするとプロフィールへ遷移すること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
      userRoles: null,
      lineNickname: null,
    })
    
vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: { id: 'test-id', email: 'test@ccc', password: 'pass' }, // passwordを追加！
        error: null 
      }),
    } as any)

    render(<MemberLoginPage />)
    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), { target: { value: 'test@ccc' } })
    fireEvent.change(screen.getByPlaceholderText(/パスワードを入力/), { target: { value: 'pass' } }) // passを入力
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/members/profile')
    })
  })

  // 6. ブラウザログイン失敗時の挙動
  it('【ブラウザ】認証失敗時に適切なエラーアラートが出ること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      currentLineId: null,
      user: null,
      userRoles: null,
      lineNickname: null,
    })
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
    } as any)

    render(<MemberLoginPage />)

    fireEvent.change(screen.getByPlaceholderText(/メールアドレスを入力/), {
      target: { value: 'test@ccc' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('メールアドレスまたはパスワードが正しくありません')
    })
  })
})