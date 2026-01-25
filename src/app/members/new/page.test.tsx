/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.2.3
 * Update  : 2026-01-25
 * 内容：
 * V1.2.3
 * - レイアウト刷新（V1.2.3）に伴い、新設項目（管理者メモ等）の検証を追加
 * - 80文字ワードラップ適用
 * V1.2.2
 * - Suspense構成への変更に対応し、インポートパスを修正
 * V1.2.1
 * - toHaveAttribute エラー回避のため、プロパティ直接参照による readOnly 検証に変更
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

describe('MemberNewPage (レイアウト刷新後の検証)', () => {
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
    // Auth情報をモック
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: TEST_NICKNAME,
      user: null,
    })

    // URLパラメータをモック
    ;(useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'email' ? TEST_EMAIL : null)
    })

    render(<MemberNewPage />)

    // ニックネームの検証（プレースホルダーではなく aria-label がないため
    // inputを特定してvalueを確認）
    const nicknameInput = screen.getByDisplayValue(TEST_NICKNAME)
    expect((nicknameInput as any).readOnly).toBe(true)

    // メールの値と編集不可属性の検証
    const emailInput = screen.getByDisplayValue(TEST_EMAIL)
    expect((emailInput as any).readOnly).toBe(true)
  })

  it('ロード中は適切なメッセージが表示され、コンテンツが隠されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: true,
      currentLineId: null,
      user: null,
    })
    render(<MemberNewPage />)
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
  })

  it('新レイアウトの全セクションと重要項目が表示されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)

    // 各セクションタイトルの確認
    expect(screen.getByText('基本情報')).toBeTruthy()
    expect(screen.getByText('プロフィール情報')).toBeTruthy()
    expect(screen.getByText('緊急連絡情報')).toBeTruthy()

    // 必須マーク付きラベルの確認
    expect(screen.getByText(/氏名（漢字）/)).toBeTruthy()
    expect(screen.getByText(/パスワード/)).toBeTruthy()

    // 新設項目の確認
    expect(screen.getByPlaceholderText('郵便番号')).toBeTruthy()
    expect(screen.getByPlaceholderText('事務局への伝達事項')).toBeTruthy()
    expect(screen.getByText('管理者向け連絡事項')).toBeTruthy()
  })

  it('会員登録申請ボタンが正しい文言で表示されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
    render(<MemberNewPage />)
    expect(screen.getByText('新規会員登録申請')).toBeTruthy()
  })

  it('【エッジケース】LINE名が不在の場合、ニックネーム欄が空であること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: null,
      user: null,
    })
    render(<MemberNewPage />)
    
    // 修正不可属性がついている空のinputを探す
    const inputs = screen.getAllByRole('textbox')
    const nickInput = inputs.find(i => (i as any).readOnly && !(i as any).value)
    expect(nickInput).toBeDefined()
  })
})