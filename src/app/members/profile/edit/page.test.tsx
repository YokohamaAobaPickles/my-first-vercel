/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V2.5.0
 * Update  : 2026-02-01
 * Remarks : 
 * V2.5.0 - 追加：メールアドレス、パスワード変更（一致確認・現在パスワード照合）の検証。
 * V2.4.0 - 網羅：全入力項目、読取専用項目、公開フラグの検証を統合。
 * V2.3.1 - 統合：DUPRレート入力の検証を追加。
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
import { updateMemberProfile, updateMemberPassword } from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberProfile: vi.fn(),
  updateMemberPassword: vi.fn(),
}))

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('EditProfilePage - 総合検証 V2.4.0', () => {
  const TEST_USER: Partial<Member> = {
    id: 'user-123',
    email: 'test@example.com',
    member_number: '1005',
    name: '山田 太郎',
    nickname: 'たろう',
    name_roma: 'Taro Yamada',
    postal: '100-0001',
    address: '東京都千代田区',
    tel: '03-1111-2222',
    line_id: 'L_12345',
    profile_memo: 'よろしくお願いします',
    emg_tel: '090-1111-1111',
    emg_rel: '父',
    emg_memo: '緊急時メモ',
    dupr_id: 'WKRV2Q',
    dupr_rate_doubles: 3.500,
    dupr_rate_singles: 3.200,
    is_profile_public: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => { })

    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
    })
    vi.mocked(updateMemberProfile).mockResolvedValue({
      success: true,
      data: null,
      error: null
    })
  })

  describe('1. 表示・構成の検証（全項目チェック）', () => {
    it('【読取専用】編集不可の項目が正しく表示され、inputでないこと', () => {
      render(<EditProfilePage />)

      // 会員番号、氏名、LINE IDは編集不可（テキスト表示）の仕様
      expect(screen.getByText('1005')).toBeInTheDocument()
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('L_12345')).toBeInTheDocument()

      const nameInput = screen.queryByDisplayValue('山田 太郎')
      expect(nameInput?.tagName).not.toBe('INPUT')
    })

    it('【初期値】全編集フィールドに既存データが正しく反映されていること', () => {
      render(<EditProfilePage />)

      expect(screen.getByLabelText(/ニックネーム/)).toHaveValue('たろう')
      expect(screen.getByLabelText(/メールアドレス/)).toHaveValue('test@example.com')
      expect(screen.getByLabelText(/氏名（ローマ字）/)).toHaveValue('Taro Yamada')
      expect(screen.getByLabelText(/郵便番号/)).toHaveValue('100-0001')
      expect(screen.getByLabelText(/住所/)).toHaveValue('東京都千代田区')
      expect(screen.getByLabelText(/電話番号/)).toHaveValue('03-1111-2222')
      expect(screen.getByLabelText(/プロフィールメモ/)).toHaveValue('よろしくお願いします')
      expect(screen.getByLabelText(/緊急連絡先電話/)).toHaveValue('090-1111-1111')
      expect(screen.getByLabelText(/続柄/)).toHaveValue('父')
      expect(screen.getByLabelText(/緊急連絡メモ/)).toHaveValue('緊急時メモ')
      expect(screen.getByLabelText(/DUPR ID/)).toHaveValue('WKRV2Q')
      expect(screen.getByLabelText(/DUPR Doubles/)).toHaveValue(3.5)
      expect(screen.getByLabelText(/DUPR Singles/)).toHaveValue(3.2)
      
      // 公開設定チェックボックスの初期値
      const checkbox = screen.getByLabelText(/プロフィールを他会員に公開する/)
      expect(checkbox).toBeChecked()
    })
  })

  describe('2. 更新処理の検証（全項目網羅）', () => {
    it('【正常系】全項目を変更してAPIに正しい型で送信されること', async () => {
      render(<EditProfilePage />)

      // 各項目を書き換え
      fireEvent.change(screen.getByLabelText(/ニックネーム/), { target: { value: 'NEWニック' } })
      fireEvent.change(screen.getByLabelText(/氏名（ローマ字）/), { target: { value: 'New Name' } })
      fireEvent.change(screen.getByLabelText(/郵便番号/), { target: { value: '999-9999' } })
      fireEvent.change(screen.getByLabelText(/住所/), { target: { value: '新住所' } })
      fireEvent.change(screen.getByLabelText(/電話番号/), { target: { value: '080-0000-0000' } })
      fireEvent.change(screen.getByLabelText(/プロフィールメモ/), { target: { value: '新メモ' } })
      fireEvent.change(screen.getByLabelText(/緊急連絡先電話/), { target: { value: '070-0000-0000' } })
      fireEvent.change(screen.getByLabelText(/続柄/), { target: { value: '配偶者' } })
      fireEvent.change(screen.getByLabelText(/緊急連絡メモ/), { target: { value: '新緊急メモ' } })
      fireEvent.change(screen.getByLabelText(/DUPR ID/), { target: { value: 'NEW_DUPR' } })
      fireEvent.change(screen.getByLabelText(/DUPR Doubles/), { target: { value: '4.567' } })
      fireEvent.change(screen.getByLabelText(/DUPR Singles/), { target: { value: '4.123' } })
      
      // 公開設定を反転
      const checkbox = screen.getByLabelText(/プロフィールを他会員に公開する/)
      fireEvent.click(checkbox)

      const saveBtn = screen.getByRole('button', { name: '変更を保存' })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(updateMemberProfile).toHaveBeenCalledWith(
          TEST_USER.id,
          {
            ...TEST_USER,
            nickname: 'NEWニック',
            name_roma: 'New Name',
            postal: '999-9999',
            address: '新住所',
            tel: '080-0000-0000',
            profile_memo: '新メモ',
            emg_tel: '070-0000-0000',
            emg_rel: '配偶者',
            emg_memo: '新緊急メモ',
            dupr_id: 'NEW_DUPR',
            dupr_rate_doubles: 4.567, // 数値型変換のチェック
            dupr_rate_singles: 4.123, // 数値型変換のチェック
            is_profile_public: false, // 公開フラグ反転のチェック
          }
        )
        expect(window.alert).toHaveBeenCalledWith('プロフィールを更新しました')
      })
    })

    it('【異常系】APIエラー時に適切なアラートが表示されること', async () => {
      vi.mocked(updateMemberProfile).mockResolvedValue({
        success: false,
        data: null,
        error: { message: 'サーバー通信エラー' }
      })

      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('エラー: サーバー通信エラー')
      })
    })
  })

  describe('3. 特殊な入力パターンの検証', () => {
    it('DUPRレートが空欄の場合、nullとしてAPIに送信されること', async () => {
      render(<EditProfilePage />)
      const doublesInput = screen.getByLabelText(/DUPR Doubles/)
      fireEvent.change(doublesInput, { target: { value: '', name: 'dupr_rate_doubles' } })

      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        const callArgs = vi.mocked(updateMemberProfile).mock.calls[0][1]
        expect(callArgs.dupr_rate_doubles).toBeNull()
      })
    })

    it('キャンセルボタン押下で router.back が呼ばれること', () => {
      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('4. パスワード変更の検証', () => {
    it('新パスワードと確認用が一致しないときエラーメッセージを表示し更新しない', async () => {
      render(<EditProfilePage />)
      fireEvent.change(screen.getByLabelText(/現在のパスワード/), {
        target: { value: 'oldpass' },
      })
      fireEvent.change(screen.getByLabelText(/^新パスワード$/), {
        target: { value: 'newpass' },
      })
      fireEvent.change(screen.getByLabelText(/新パスワード（確認）/), {
        target: { value: 'different' },
      })
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '新パスワードと確認用が一致しません。'
        )
      })
      expect(updateMemberPassword).not.toHaveBeenCalled()
      expect(updateMemberProfile).not.toHaveBeenCalled()
    })

    it('現在のパスワードが間違っているときエラーメッセージを表示し更新しない', async () => {
      vi.mocked(updateMemberPassword).mockResolvedValue({
        success: false,
        data: null,
        error: { message: '現在のパスワードが正しくありません' },
      })

      render(<EditProfilePage />)
      fireEvent.change(screen.getByLabelText(/現在のパスワード/), {
        target: { value: 'wrongpass' },
      })
      fireEvent.change(screen.getByLabelText(/^新パスワード$/), {
        target: { value: 'newpass' },
      })
      fireEvent.change(screen.getByLabelText(/新パスワード（確認）/), {
        target: { value: 'newpass' },
      })
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          '現在のパスワードが正しくありません'
        )
      })
      expect(updateMemberPassword).toHaveBeenCalledWith(
        TEST_USER.id,
        'wrongpass',
        'newpass'
      )
      expect(updateMemberProfile).not.toHaveBeenCalled()
    })

    it('パスワード変更成功時はプロフィールも更新される', async () => {
      vi.mocked(updateMemberPassword).mockResolvedValue({
        success: true,
        data: null,
        error: null,
      })

      render(<EditProfilePage />)
      fireEvent.change(screen.getByLabelText(/現在のパスワード/), {
        target: { value: 'oldpass' },
      })
      fireEvent.change(screen.getByLabelText(/^新パスワード$/), {
        target: { value: 'newpass' },
      })
      fireEvent.change(screen.getByLabelText(/新パスワード（確認）/), {
        target: { value: 'newpass' },
      })
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        expect(updateMemberPassword).toHaveBeenCalledWith(
          TEST_USER.id,
          'oldpass',
          'newpass'
        )
        expect(updateMemberProfile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith('プロフィールを更新しました')
      })
    })
  })
})