/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.5.30
 * Update  : 2026-01-28
 * Remarks : 
 * V1.5.30 - 拡充：バリデーション失敗、LINE連携、モード切替のテストを追加。
 * V1.5.30 - 修正：正規表現によるラベル検索を全ケースに適用し、堅牢性を向上。
 * V1.5.30 - 書式：80カラム、判定ごとの改行、スタイル定義の改行を遵守。
 */

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react'
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  registerMember,
  fetchMemberByNicknameAndMemberNumber
} from '@/lib/memberApi'

vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null)
  })
}))

const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => { })

describe('MemberNewPage V1.5.30 統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  describe('UI・表示・初期状態の検証', () => {
    it('【通常表示】必須項目ラベルが正しく存在すること', () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: null,
        lineNickname: null,
        userRoles: null,
        user: null
      })
      render(<MemberNewPage />)
      expect(screen.getByLabelText(/氏名（漢字）/)).toBeVisible()
      expect(screen.getByLabelText(/性別/)).toBeVisible()
      expect(screen.getByLabelText(/生年月日/)).toBeVisible()
    })

    it('【LINE連携】LINE情報がある時、ニックネームが固定されること', () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: 'LINE_123',
        lineNickname: 'ライン太郎',
        userRoles: null,
        user: null
      })
      render(<MemberNewPage />)
      const nickInput = screen.getByLabelText(/ニックネーム/) as HTMLInputElement
      expect(nickInput.value).toBe('ライン太郎')
      expect(nickInput).toHaveAttribute('readOnly')
    })

    it('【ゲスト切替】ゲスト登録モードで紹介者入力欄が出ること', () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: null,
        lineNickname: null,
        userRoles: null,
        user: null
      })
      render(<MemberNewPage />)
      fireEvent.click(screen.getByText('ゲスト登録'))
      expect(screen.getByLabelText(/紹介者のニックネーム/)).toBeVisible()
      expect(screen.getByLabelText(/紹介者の会員番号/)).toBeVisible()
    })
  })

  describe('バリデーションと保存ロジック', () => {
    beforeEach(() => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        currentLineId: null,
        lineNickname: null,
        userRoles: null,
        user: null
      })
    })

    it('【異常系】パスワード未入力でアラートを表示し、送信しないこと', 
      async () => {
      render(<MemberNewPage />)
      fireEvent.change(screen.getByLabelText(/氏名（漢字）/), 
        { target: { value: '名前のみ' } })
      
      const submitButton = screen.getByRole('button', { 
        name: /新規会員登録申請/ 
      })
      fireEvent.click(submitButton)

      expect(mockAlert).toHaveBeenCalled()
      expect(registerMember).not.toHaveBeenCalled()
    })

    it('【ゲスト異常系】紹介者ニックネーム・会員番号が一致しないとき「該当するメンバーがいません」で登録しないこと',
      async () => {
      vi.mocked(fetchMemberByNicknameAndMemberNumber).mockResolvedValue({
        success: true,
        data: null,
        error: null
      })

      render(<MemberNewPage />)
      fireEvent.click(screen.getByText('ゲスト登録'))
      fireEvent.change(screen.getByLabelText(/紹介者のニックネーム/), {
        target: { value: '紹介者' }
      })
      fireEvent.change(screen.getByLabelText(/紹介者の会員番号/), {
        target: { value: '0001' }
      })
      fireEvent.change(screen.getByLabelText(/氏名（漢字）/), {
        target: { value: 'ゲスト太郎' }
      })
      fireEvent.change(screen.getByLabelText(/氏名（ローマ字）/), {
        target: { value: 'Guest Taro' }
      })
      fireEvent.change(screen.getByLabelText(/性別/), { target: { value: '男性' } })
      fireEvent.change(screen.getByLabelText(/生年月日/), {
        target: { value: '2000-01-01' }
      })
      fireEvent.change(document.getElementById('nickname')!, {
        target: { value: 'ゲスト' }
      })
      fireEvent.change(screen.getByLabelText(/パスワード/), {
        target: { value: 'password123' }
      })
      fireEvent.change(screen.getByLabelText(/メールアドレス/), {
        target: { value: 'guest@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/緊急電話番号/), {
        target: { value: '090-0000-0000' }
      })
      fireEvent.change(screen.getByLabelText(/続柄/), { target: { value: '本人' } })

      fireEvent.click(screen.getByRole('button', { name: /新規会員登録申請/ }))

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('該当するメンバーがいません')
      })
      expect(registerMember).not.toHaveBeenCalled()
    })

    it('【正常系】全項目入力時に登録処理を実行し遷移すること', 
      async () => {
      vi.mocked(registerMember).mockResolvedValue({
        success: true,
        data: { id: 'new-user-123' } as any,
        error: null
      })

      render(<MemberNewPage />)

      // 入力処理
      fireEvent.change(screen.getByLabelText(/氏名（漢字）/), 
        { target: { value: 'テスト太郎' } })
      fireEvent.change(screen.getByLabelText(/氏名（ローマ字）/), 
        { target: { value: 'Taro Test' } })
      fireEvent.change(screen.getByLabelText(/性別/), 
        { target: { value: '男性' } })
      fireEvent.change(screen.getByLabelText(/生年月日/), 
        { target: { value: '2000-01-01' } })
      fireEvent.change(screen.getByLabelText(/ニックネーム/), 
        { target: { value: 'テス太郎' } })
      fireEvent.change(screen.getByLabelText(/メールアドレス/), 
        { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByLabelText(/パスワード/), 
        { target: { value: 'password123' } })
      fireEvent.change(screen.getByLabelText(/緊急電話番号/), 
        { target: { value: '090-0000-0000' } })
      fireEvent.change(screen.getByLabelText(/続柄/), 
        { target: { value: '本人' } })

      const submitButton = screen.getByRole('button', { 
        name: /新規会員登録申請/ 
      })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(registerMember).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/members/profile')
      })
    })
  })
})