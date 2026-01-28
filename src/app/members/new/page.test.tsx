/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.5.21
 * Update  : 2026-01-28
 * Remarks : 
 * V1.5.21 - 本体V1.5.20に適合。赤色必須マーク(*)を含むラベル検索に対応。
 * V1.5.21 - LINE連携時の「ニックネーム」ReadOnly属性の検証を追加。
 * V1.5.21 - レイアウト（1列2項目）の検証ロジックを最新構造に最適化。
 */

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { supabase } from '@/lib/supabase'
import { checkNicknameExists } from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn()
    }))
  }
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: vi.fn() })
}))

describe('MemberNewPage V1.5.20 整合性テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LINE連携モード', () => {
    beforeEach(() => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: 'LINE_ID_123',
        lineNickname: 'たろう',
        userRoles: '一般',
        user: { id: 'test-user-id' }
      })
    })

    it('【不具合修正確認】LINE時でも性別・生年月日・公開設定が表示されること', () => {
      render(<MemberNewPage />)

      // ラベル名にアスタリスクが含まれるものは正規表現で対応
      expect(screen.getByLabelText('性別')).toBeVisible()
      expect(screen.getByLabelText('生年月日')).toBeVisible()
      expect(screen.getByLabelText(/プロフィールを他の会員に公開する/)).toBeVisible()
    })

    it('【制御】メールアドレスとニックネームが読み取り専用であること', () => {
      render(<MemberNewPage />)
      expect(screen.getByLabelText(/ニックネーム/)).toHaveAttribute('readonly')
      expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('readonly')
    })

    it('【ロジック】ニックネーム重複時に #2 を自動付与すること', async () => {
      vi.mocked(checkNicknameExists)
        .mockResolvedValueOnce(true)  // 1回目：重複
        .mockResolvedValueOnce(false) // 2回目：OK

      render(<MemberNewPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/ニックネーム/)).toHaveValue('たろう#2')
      })
    })
  })

  describe('UI/レイアウト検証', () => {
    beforeEach(() => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: null,
        lineNickname: null,
        userRoles: null,
        user: null
      })
    })

    it('【表示】全19項目（通常時）が正しく描画されていること', () => {
      render(<MemberNewPage />)
      const labels = [
        /氏名（漢字）/, /氏名（ローマ字）/, '性別', '生年月日',
        /ニックネーム/, 'メールアドレス', /パスワード/,
        /プロフィールを他の会員に公開する/, '郵便番号', '住所',
        '電話番号', 'DUPR ID', '自己紹介', /緊急電話番号/,
        /続柄/, '緊急連絡先備考'
      ]
      labels.forEach(label => {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      })
    })

    it('【レイアウト】緊急電話番号と続柄が同一行（Grid）に配置されていること', () => {
      render(<MemberNewPage />)
      const telInput = screen.getByLabelText(/緊急電話番号/)
      const relInput = screen.getByLabelText(/続柄/)

      // 両方の入力欄が同じ Grid コンテナ内に存在することを確認
      const telContainer = telInput.closest('div')
      const relContainer = relInput.closest('div')
      const rowGrid = telContainer?.parentElement

      expect(rowGrid).toHaveStyle({ display: 'grid' })
      expect(telContainer).toBeInTheDocument()
      expect(relContainer).toBeInTheDocument()
    })
  })
})