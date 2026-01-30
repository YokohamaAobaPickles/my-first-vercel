/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V2.3.1
 * Update  : 2026-01-31
 * Remarks : 
 * V2.3.0 - 統合：V2.2.7をベースに、DUPRレート(Doubles/Singles)入力の検証を追加。
 * V2.3.0 - 強化：初期値、HTMLバリデーション、API保存パラメータの網羅性を維持。
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

describe('EditProfilePage - 総合検証 V2.3.0', () => {
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
    dupr_id: 'WKRV2Q',
    dupr_rate_doubles: 3.500,
    dupr_rate_singles: 3.200,
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

  describe('1. 表示・構成の検証', () => {
    it('【表示】閲覧のみの項目が正しい形式で表示されていること', () => {
      render(<EditProfilePage />)

      expect(screen.getByText('0101')).toBeInTheDocument()
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('L_12345')).toBeInTheDocument()

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

        expect(screen.getAllByText('*')).toHaveLength(3)
      })

    it('【初期値】全編集フィールド（DUPR含む）に既存データが反映されていること',
      () => {
        render(<EditProfilePage />)

        expect(screen.getByLabelText(/ニックネーム/)).toHaveValue('たろう')
        expect(screen.getByLabelText(/郵便番号/)).toHaveValue('100-0001')
        expect(screen.getByLabelText(/DUPR Doubles/)).toHaveValue(3.5)
        expect(screen.getByLabelText(/DUPR Singles/)).toHaveValue(3.2)
        expect(screen.getByLabelText(/プロフィールメモ/))
          .toHaveValue('よろしくお願いします')
      })
  })

  describe('2. 更新処理の検証', () => {
    it('【正常系】DUPRレートを含む値を変更してAPIが呼ばれること', async () => {
      render(<EditProfilePage />)

      fireEvent.change(screen.getByLabelText(/住所/),
        { target: { value: '神奈川県横浜市' } })

      fireEvent.change(screen.getByLabelText(/DUPR Doubles/),
        { target: { value: '4.123' } })

      fireEvent.change(screen.getByLabelText(/DUPR Singles/),
        { target: { value: '3.885' } })

      const saveBtn = screen.getByRole('button', { name: '変更を保存' })
      fireEvent.click(saveBtn)

      await waitFor(() => {
        expect(updateMemberProfile).toHaveBeenCalledWith(
          TEST_USER.id,
          expect.objectContaining({
            address: '神奈川県横浜市',
            dupr_rate_doubles: 4.123,
            dupr_rate_singles: 3.885
          })
        )
        expect(window.alert).toHaveBeenCalledWith('プロフィールを更新しました')
        expect(mockPush).toHaveBeenCalledWith('/members/profile')
      })
    })

    it('【異常系】APIエラー時にアラートで通知されること', async () => {
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
  })

  describe('3. ナビゲーションの検証', () => {
    it('【戻る】キャンセルボタン押下で router.back が呼ばれること', () => {
      render(<EditProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('DUPR手動入力の検証', () => {
    it('DUPR ID、Doubles/Singlesレートを入力し、正しく状態が更新されること', () => {
      render(<EditProfilePage />)

      const idInput = screen.getByLabelText('DUPR ID')
      const doublesInput = screen.getByLabelText('DUPR Doubles')
      const singlesInput = screen.getByLabelText('DUPR Singles')

      fireEvent.change(idInput, { target: { value: 'WKRV2Q', name: 'dupr_id' } })
      fireEvent.change(doublesInput, { target: { value: '4.123', name: 'dupr_rate_doubles' } })
      fireEvent.change(singlesInput, { target: { value: '3.500', name: 'dupr_rate_singles' } })

      expect(idInput).toHaveValue('WKRV2Q')
      expect(doublesInput).toHaveValue(4.123)
      expect(singlesInput).toHaveValue(3.5)
    })

    it('保存時にレートが文字列から数値型（float）に変換されて API に送信されること', async () => {
      vi.mocked(updateMemberProfile).mockResolvedValue({
        success: true,
        data: null,
        error: null
      })

      render(<EditProfilePage />)

      // 編集可能な項目を入力
      fireEvent.change(screen.getByLabelText('DUPR Doubles'), {
        target: { value: '4.567', name: 'dupr_rate_doubles' }
      })
      fireEvent.change(screen.getByLabelText('DUPR Singles'), {
        target: { value: '4.123', name: 'dupr_rate_singles' }
      })

      // 保存ボタンをクリック
      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        // updateMemberProfile の第2引数（payload）の数値項目を検証
        const callArgs = vi.mocked(updateMemberProfile).mock.calls[0][1]
        expect(typeof callArgs.dupr_rate_doubles).toBe('number')
        expect(callArgs.dupr_rate_doubles).toBe(4.567)
        expect(typeof callArgs.dupr_rate_singles).toBe('number')
        expect(callArgs.dupr_rate_singles).toBe(4.123)
      })
    })

    it('レートが空欄の場合、null として API に送信されること', async () => {
      vi.mocked(updateMemberProfile).mockResolvedValue({
        success: true,
        data: null,
        error: null
      })

      render(<EditProfilePage />)

      const doublesInput = screen.getByLabelText('DUPR Doubles')
      fireEvent.change(doublesInput, { target: { value: '', name: 'dupr_rate_doubles' } })

      fireEvent.click(screen.getByRole('button', { name: '変更を保存' }))

      await waitFor(() => {
        const callArgs = vi.mocked(updateMemberProfile).mock.calls[0][1]
        expect(callArgs.dupr_rate_doubles).toBeNull()
      })
    })
  })

})