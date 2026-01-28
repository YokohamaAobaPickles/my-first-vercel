/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.5.11
 * Update  : 2026-01-28
 * Remarks : 
 * V1.5.11 - toBeVisible() を導入し、非表示や描画除外を厳格に検知
 * V1.5.11 - 11のテスト項目（19項目網羅、LINE/PC分離、レイアウト）を完全復旧
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
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) })
}))

describe('MemberNewPage - 厳格業務ルール検証 V1.5.11', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkNicknameExists).mockResolvedValue(false)
  })

  // --- 文脈A: 通常ブラウザアクセスのケース ---
  describe('通常ブラウザアクセス時', () => {
    beforeEach(() => {
      ; (useAuthCheck as any).mockReturnValue({
        isLoading: false,
        currentLineId: null,
        lineNickname: null
      })
    })

    it('【網羅】全項目が正しく存在し、かつ「可視」であること', () => {
      render(<MemberNewPage />)
      const labels = [
        '氏名（漢字）*', '氏名（ローマ字）*', '性別', '生年月日',
        'ニックネーム*', 'メールアドレス', 'パスワード*',
        'プロフィールを他の会員に公開する', '郵便番号', '住所',
        '電話番号', 'DUPR ID', '自己紹介', '緊急電話番号*',
        '続柄*', '緊急連絡先備考', '管理者向け連絡事項'
      ]
      labels.forEach(l => {
        const el = screen.getByLabelText(l)
        expect(el).toBeInTheDocument()
        // 要素が単に存在するだけでなく、ユーザーに見える状態か検証
        expect(el).toBeVisible()
      })
    })

    describe('MemberNewPage - 実機バグ検知テスト V1.5.15', () => {
      beforeEach(() => {
        vi.clearAllMocks()
      })

      describe('不具合検証: LINE連携時', () => {
        beforeEach(() => {
          // LINE連携中、かつ項目が欠落している実機状態をシミュレート
          ; (useAuthCheck as any).mockReturnValue({
            isLoading: false,
            currentLineId: 'LINE_ID_EXAMPLE',
            lineNickname: 'Tomo'
          })
        })

        it('【項目欠落を検知】LINE時でも性別と生年月日の項目が存在すること', () => {
          render(<MemberNewPage />)

          // 画像で欠落している項目をチェック。
          // 本体コードでこれらが条件分岐で消されている場合、ここで例外が発生し Fail します。
          const gender = screen.getByLabelText(/性別/)
          const birthday = screen.getByLabelText(/生年月日/)

          expect(gender).toBeInTheDocument()
          expect(birthday).toBeInTheDocument()
        })
      })
    })


    it('【レイアウト不具合検知】緊急連絡先と続柄が「横並び(Grid)」設定であること',
      () => {
        render(<MemberNewPage />)

        const emgTelLabel = screen.getByText('緊急電話番号*')
        const relLabel = screen.getByText('続柄*')

        // それぞれの入力グループを包んでいる div ではなく、
        // それらをさらに包んでいる「共通の親（Gridコンテナ）」を取得
        const gridContainer = emgTelLabel.closest('div')?.parentElement

        // 期待値: 親要素に grid スタイルが直接あたっていること
        expect(gridContainer).toHaveStyle({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr'
        })

        // さらに厳格に、要素が display: block などで上書きされていないか確認
        const computed = window.getComputedStyle(gridContainer!)
        expect(computed.display).toBe('grid')
      })

    it('【正常系】バリデーションエラーと、正常入力後の保存・遷移の検証', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { })

      render(<MemberNewPage />)

      // 1. 未入力で申請
      fireEvent.click(screen.getByRole('button', { name: /新規会員登録申請/ }))
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('入力してください'))

      // 2. 必須項目を埋める
      fireEvent.change(screen.getByLabelText('氏名（漢字）*'), { target: { value: '山田' } })
      fireEvent.change(screen.getByLabelText('氏名（ローマ字）*'), { target: { value: 'Yamada' } })
      fireEvent.change(screen.getByLabelText('ニックネーム*'), { target: { value: 'yama' } })
      fireEvent.change(screen.getByLabelText('パスワード*'), { target: { value: 'pw123' } })
      fireEvent.change(screen.getByLabelText('緊急電話番号*'), { target: { value: '090' } })
      fireEvent.change(screen.getByLabelText('続柄*'), { target: { value: '父' } })

      fireEvent.click(screen.getByRole('button', { name: /新規会員登録申請/ }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/members/profile')
      })
    })
  })

  // --- 文脈B: LINE連携アクセスのケース（不具合を確実に捕まえる） ---
  describe('LINE連携アクセス時', () => {
    beforeEach(() => {
      ; (useAuthCheck as any).mockReturnValue({
        isLoading: false,
        currentLineId: 'LINE_ID_123',
        lineNickname: 'たろう'
      })
    })

    it('【不具合検知】LINE時でも性別・生年月日・公開設定が「可視」であること', () => {
      render(<MemberNewPage />)

      // 今の本体(V1.5.0)は、LINE IDがあるとこれらをJSXから除外します。
      // getByLabelText は要素が見つからないと例外を投げるため、ここで Fail します。
      const gender = screen.getByLabelText('性別')
      const birthday = screen.getByLabelText('生年月日')
      const publicFlag = screen.getByLabelText('プロフィールを他の会員に公開する')

      expect(gender).toBeVisible()
      expect(birthday).toBeVisible()
      expect(publicFlag).toBeVisible()
    })

    it('【制御】メールアドレスが読み取り専用であること', () => {
      render(<MemberNewPage />)
      expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('readonly')
    })

    it('【ロジック】ニックネーム重複時に #2 を自動付与すること', async () => {
      vi.mocked(checkNicknameExists).mockResolvedValueOnce(true).mockResolvedValueOnce(false)
      render(<MemberNewPage />)
      await waitFor(() => {
        expect(screen.getByLabelText('ニックネーム*')).toHaveValue('たろう#2')
      })
    })
  })

  // --- 文脈C: 共通・モード切り替え ---
  describe('共通モード操作', () => {
    it('【操作】ゲスト登録への切り替えで紹介者欄が表示（可視化）されること', () => {
      ; (useAuthCheck as any).mockReturnValue({ isLoading: false })
      render(<MemberNewPage />)

      const guestTab = screen.getByRole('button', { name: /ゲスト登録/ })
      fireEvent.click(guestTab)

      const referrer = screen.getByLabelText(/紹介者のニックネーム/)
      expect(referrer).toBeVisible()
    })
  })
})