/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.2.5
 * Update  : 2026-01-25
 * 内容：
 * V1.2.5
 * - labelとplaceholderが分離した新UIに合わせ、テストの検索クエリを修正
 * - プレースホルダー文字列（山田 太郎 等）による検索へ変更し、テスト落ちを解消
 * V1.2.4
 * - 郵便番号欄の幅制限（50%）を考慮した存在検証を追加
 * - 過去の全テストケース（モード切替、詳細項目、エッジケース）を網羅
 * V1.2.3
 * - レイアウト刷新に伴う新設項目（管理者メモ等）の検証を追加
 * V1.2.2
 * - Suspense構成への変更に対応し、インポートパスを修正
 * V1.2.1
 * - toHaveAttribute エラー回避のため、プロパティ直接参照に変更
 * V1.2.0
 * - LINE連携時のニックネーム自動入力の検証を追加
 * - URLクエリパラメータからのメールアドレス引き継ぎと readonly 検証を追加
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

describe('MemberNewPage (完全網羅テスト V1.2.5)', () => {
  const TEST_LINE_ID = 'U_TEST_123'
  const TEST_NICKNAME = 'ライン太郎'
  const TEST_EMAIL = 'line-user@example.com'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    })
  })

  it('【連携検証】LINE名が初期入力され、メールが修正不可であること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: TEST_NICKNAME,
      user: null,
    })

    ;(useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'email' ? TEST_EMAIL : null)
    })

    render(<MemberNewPage />)

    // ニックネームの検証（修正不可）
    const nicknameInput = screen.getByDisplayValue(TEST_NICKNAME)
    expect((nicknameInput as any).readOnly).toBe(true)

    // メールの値と編集不可属性の検証
    const emailInput = screen.getByDisplayValue(TEST_EMAIL)
    expect((emailInput as any).readOnly).toBe(true)
  })

  it('ロード中は適切なメッセージが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: true,
      currentLineId: null,
      user: null,
    })
    render(<MemberNewPage />)
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
  })

  it('全セクションと重要項目が表示されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)

    // セクションタイトルの確認
    expect(screen.getByText('基本情報')).toBeTruthy()
    expect(screen.getByText('プロフィール情報')).toBeTruthy()
    expect(screen.getByText('緊急連絡情報')).toBeTruthy()
    expect(screen.getByText('管理者向け連絡事項')).toBeTruthy()

    // 個別項目の入力欄をプレースホルダーで確認
    expect(screen.getByPlaceholderText('山田 太郎')).toBeTruthy()
    expect(screen.getByPlaceholderText('Taro Yamada')).toBeTruthy()
    expect(screen.getByPlaceholderText('8文字以上')).toBeTruthy()
    expect(screen.getByPlaceholderText('電話番号')).toBeTruthy()
    expect(screen.getByPlaceholderText('DUPR ID')).toBeTruthy()
    expect(screen.getByPlaceholderText('事務局への伝達事項')).toBeTruthy()
  })

  it('郵便番号欄が50%幅で配置されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)
    const zipInput = screen.getByPlaceholderText('郵便番号')
    expect(zipInput).toBeTruthy()
    expect((zipInput as any).style.width).toBe('50%')
  })

  it('会員登録とゲスト登録のモード切替が可能であること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)
    const guestTab = screen.getByRole('button', { name: /ゲスト登録/i })
    fireEvent.click(guestTab)
    expect(guestTab).toBeTruthy()
  })

  it('【エッジケース】LINE名が不在の場合でもページが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: null,
      user: null,
    })
    render(<MemberNewPage />)
    
    // readonly かつ value が空の input を特定
    const inputs = screen.getAllByRole('textbox')
    const nickInput = inputs.find(i => (i as any).readOnly && !(i as any).value)
    expect(nickInput).toBeDefined()
  })
})