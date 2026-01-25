/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.2.1
 * Update  : 2026-01-25
 * 内容：
 * V1.2.1
 * - toHaveAttribute エラー回避のため、プロパティ直接参照による readOnly 検証に変更
 * V1.2.0
 * - LINE連携時のニックネーム自動入力の検証を追加
 * - URLクエリパラメータからのメールアドレス引き継ぎと readonly 検証を追加
 * V1.1.0
 * - 以前のlogin/page.tsxにあった全項目のレンダリング検証を移植
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useSearchParams } from 'next/navigation'

// モックの設定
vi.mock('@/hooks/useAuthCheck')
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}))

describe('MemberNewPage (LINE連携・データ引き継ぎの検証)', () => {
  const TEST_LINE_ID = 'U_TEST_123'
  const TEST_NICKNAME = 'ライン太郎'
  const TEST_EMAIL = 'line-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
      ; (useSearchParams as any).mockReturnValue({
        get: vi.fn().mockReturnValue(null)
      })
  })

  it('【新規検証】LINE連携時、ニックネームが初期入力され、メールがreadonlyであること', () => {
    // 1. useAuthCheck からの情報をモック
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: TEST_NICKNAME,
      user: null,
    })

      // 2. URLパラメータをモック
      ; (useSearchParams as any).mockReturnValue({
        get: (key: string) => (key === 'email' ? TEST_EMAIL : null)
      })

    render(<MemberNewPage />)

    // 3. ニックネームの検証
    const nicknameInput = screen.getByPlaceholderText(/ニックネーム/i)
    expect((nicknameInput as any).value).toBe(TEST_NICKNAME)

    // 4. メールの値と、編集不可属性の検証
    const emailInput = screen.getByPlaceholderText(/メールアドレス/i)
    expect((emailInput as any).value).toBe(TEST_EMAIL)
    // プロパティを直接チェックすることで環境依存を排除
    expect((emailInput as any).readOnly).toBe(true)
  })

  it('ロード中は適切なメッセージが表示され、フォームは表示されないこと', () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: true,
      currentLineId: null,
      user: null,
    })
    render(<MemberNewPage />)
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
  })

  it('以前の実装に含まれていたすべての詳細項目が表示されること', () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)
    expect(screen.getByPlaceholderText(/氏名（漢字）/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/DUPR ID/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/ニックネーム/i)).toBeTruthy()
  })

  it('会員登録とゲスト登録のモード切替が可能であること', () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)
    const guestTab = screen.getByRole('button', { name: /ゲスト登録/i })
    fireEvent.click(guestTab)
    expect(screen.getByText(/ゲストとして登録する/i)).toBeTruthy()
  })

  it('【エッジケース】LINE名が取得できなかった場合、ニックネーム欄は空のままであること', () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: null, // 名前が取れなかったケース
      user: null,
    })

    render(<MemberNewPage />)
    const nicknameInput = screen.getByPlaceholderText(/ニックネーム/i)
    expect((nicknameInput as any).value).toBe('')
  })

})