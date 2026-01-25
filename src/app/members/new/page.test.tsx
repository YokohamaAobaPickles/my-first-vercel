/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-01-25
 * 内容：
 * V1.1.0
 * - 以前のlogin/page.tsxにあった全項目（DUPR ID, 自己紹介, モード切替等）の
 * レンダリングとバリデーション準備を検証するテストに更新
 * - 80文字ワードラップ、条件判定の改行を適用
 * V1.0.0
 * - 新規登録ページの初期レンダリングテスト作成
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberNewPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

// 認証チェックとルーターのモック化
vi.mock('@/hooks/useAuthCheck')
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}))

describe('MemberNewPage (詳細登録プロセスの検証)', () => {
  const TEST_LINE_ID = 'U_TEST_123'

  beforeEach(() => {
    vi.clearAllMocks()
    // 認証済みの基本状態を設定
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      user: null,
    })
  })

  it('以前の実装に含まれていたすべての詳細項目が表示されること', () => {
    render(<MemberNewPage />)

    // セクションタイトルの存在確認
    expect(screen.getByText(/基本情報/i)).toBeTruthy()
    expect(screen.getByText(/プロフィール情報/i)).toBeTruthy()
    expect(screen.getByText(/緊急連絡先・住所/i)).toBeTruthy()

    // 具体的な入力フィールドの存在確認
    expect(screen.getByPlaceholderText(/氏名（漢字）/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/氏名（ローマ字）/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/DUPR ID/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/自己紹介・メモ/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/電話番号/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/続柄/i)).toBeTruthy()
  })

  it('会員登録とゲスト登録のモード切替が可能であること', () => {
    render(<MemberNewPage />)

    const memberTab = screen.getByRole('button', { name: /新規会員登録/i })
    const guestTab = screen.getByRole('button', { name: /ゲスト登録/i })

    // 初期状態は会員登録ボタンがアクティブ（青色）であることを期待
    expect(memberTab.style.backgroundColor).toBe('rgb(0, 112, 243)') // #0070f3

    // ゲスト登録をクリック
    fireEvent.click(guestTab)

    // 送信ボタンの文言がゲスト用に変わることを検証
    expect(screen.getByText(/ゲストとして登録する/i)).toBeTruthy()
  })

  it('ロード中は適切なメッセージが表示され、フォームは表示されないこと', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: true,
      currentLineId: null,
      user: null,
    })

    render(<MemberNewPage />)
    
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
    expect(screen.queryByPlaceholderText(/DUPR ID/i)).toBeNull()
  })
})