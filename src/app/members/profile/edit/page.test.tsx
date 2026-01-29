/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V2.2.7
 * Update  : 2026-01-30
 * Remarks : 
 * V2.2.7 - 強化：API失敗時のエラーハンドリング、保存中のボタン状態の検証を追加。
 * V2.2.7 - 強化：閲覧のみ項目のレンダリング形式、およびtextareaの更新検証を追加。
 * V2.2.7 - 書式：80カラムラップ、判定ごとの改行、スタイル定義を遵守。
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
import '@testing-library/jest-dom'
import { Member } from '@/types/member'
import EditProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { updateMemberProfile } from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberProfile: vi.fn(),
}))

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('EditProfilePage - プロフィール編集画面の総合検証 V2.2.7', () => {
  const TEST_USER: Partial<Member> = {
    id: 'user-123',
    name: '山田 太郎',
    nickname: 'たろう',
    member_number: '0101',
    postal: '100-0001',
    address: '東京都千代田区',
    tel: '03-1111-2222',
    profile_memo: 'よろしくお願いします',
    line_id: 'L_12345',
    emg_tel: '090-1111-1111',
    emg_rel: '父',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => { })
    
    // デフォルトの認証・API成功状態
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
    })
    vi.mocked(updateMemberProfile).mockResolvedValue({
      success: true,
      data: null,
      error: null
    })
  })

  describe('1. 表示・構成の検証', () => {
    it('【表示】閲覧のみの項目が正しい形式で表示されていること', () => {
      render(<EditProfilePage />)
      
      // 会員番号は 0 パディングされているか
      expect(screen.getByText('0101')).toBeInTheDocument()
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('L_12345')).toBeInTheDocument()

      // これらの項目が input 要素ではない（閲覧のみ）ことを確認
      const nameInput = screen.queryByDisplayValue('山田 太郎')
      expect(nameInput?.tagName).not.toBe('INPUT')
    })

    it('【必須】必須項目のラベルに「*」が含まれ、HTML5バリデーションがあること', 
      () => {
      render(<EditProfilePage />)
      
      const requiredInputs = [
        { label: /ニックネーム/, name: 'nickname' },
        { label: /緊急連絡先電話/, name: 'emg_tel' },
        { label: /続柄/, name: 'emg_rel' }
      ]

      requiredInputs.forEach(({ label, name }) => {
        const input = screen.getByLabelText(label)
        expect(input).toBeRequired()
        expect(input).toHaveAttribute('name', name)
      })

      // アスタリスクの視覚的表示確認
      expect(screen.getAllByText('*')).toHaveLength(3)
    })

    it('【初期値】全編集フィールドに既存データが正しく反映されていること', () => {
      render(<EditProfilePage />)
      
      expect(screen.getByLabelText(/ニックネーム/)).toHaveValue('たろう')
      expect(screen.getByLabelText(/郵便番号/)).toHaveValue('100-0001')
      expect(screen.getByLabelText(/住所/)).toHaveValue('東京都千代田区')
      expect(screen.getByLabelText(/電話番号/)).toHaveValue('03-1111-2222')
      expect(screen.getByLabelText(/緊急連絡先電話/))
        .toHaveValue('090-1111-1111')
      expect(screen.getByLabelText(/続柄/)).toHaveValue('父')
      expect(screen.getByLabelText(/プロフィールメモ/))
        .toHaveValue('よろしくお願いします')
    })
  })

  describe('2. 更新処理の検証', () => {
    it('【正常系】値を変更して保存した際、正しいパラメータでAPIが呼ばれること', 
      async () => {
      render(<EditProfilePage />)

      fireEvent.change(screen.getByLabelText(/プロフィールメモ/), 
        { target: { value: '自己紹介を\n更新しました' } })
      
      fireEvent.change(screen.getByLabelText(/住所/), 
        { target: { value: '新住所' } })

      const saveBtn = screen.getByRole('button', { name: '変更を保存' })
      fireEvent.click(saveBtn)

      // 保存中のボタン状態確認
      expect(saveBtn).toBeDisabled()
      expect(saveBtn).toHaveTextContent('保存中...')

      await waitFor(() => {
        expect(updateMemberProfile).toHaveBeenCalledWith(
          TEST_USER.id,
          expect.objectContaining({
            profile_memo: '自己紹介を\n更新しました',
            address: '新住所'
          })
        )
        expect(window.alert).toHaveBeenCalledWith('プロフィールを更新しました')
        expect(mockPush).toHaveBeenCalledWith('/members/profile')
      })
    })

    it('【異常系】APIがエラーを返した場合、アラートで通知されること', async () => {
      vi.mocked(updateMemberProfile).mockResolvedValue({
        success: false,
        data: null,
        error: { message: 'サーバーエラー' }
      })

      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('エラー: サーバーエラー')
      })
    })

    it('【異常系】予期せぬ例外が発生した場合、汎用エラーが表示されること', 
      async () => {
      vi.mocked(updateMemberProfile).mockRejectedValue(new Error('Crash'))

      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('予期せぬエラーが発生しました')
      })
    })
  })

  describe('3. ナビゲーションの検証', () => {
    it('【戻る】キャンセルボタン押下で router.back が呼ばれること', () => {
      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
      
      expect(mockBack).toHaveBeenCalled()
    })
  })
})