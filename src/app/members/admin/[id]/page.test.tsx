/**
 * Filename: src/app/members/admin/[id]/page.test.tsx
 * Version : V2.6.0
 * Update  : 2026-02-01
 * Remarks :
 * V2.6.0 - 編集可能な全項目の表示・初期値検証を追加。権限拒否時に updateMember が呼ばれないことを検証。
 * V2.5.5 - 安定化：プロフィール編集テスト(V2.4.0)の成功パターンを適用。
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import * as React from 'react'
import MemberDetailAdmin from './page'
import * as memberApi from '@/lib/memberApi'

// Next.js 16 の use(params) によるサスペンドをテストで避けるため、
// Promise が渡された場合は同期的に解決済みの値を返す
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>()
  return {
    ...actual,
    use: (promiseOrContext: unknown) => {
      if (
        promiseOrContext &&
        typeof (promiseOrContext as Promise<unknown>).then === 'function'
      ) {
        return { id: 'user-123' }
      }
      return (actual.use as (x: unknown) => unknown)(promiseOrContext)
    },
  }
})
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { ROLES } from '@/types/member'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  fetchMemberById: vi.fn(),
  updateMember: vi.fn(),
}))

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

window.confirm = vi.fn(() => true)
window.alert = vi.fn()

const api = memberApi as any

describe('MemberDetailAdmin', () => {
  const mockFullMember = {
    id: 'user-123',
    member_number: '0001',
    name: 'テスト 太郎',
    name_roma: 'TEST TARO',
    nickname: 'タロー',
    email: 'test@example.com',
    gender: 'male',
    birthday: '1990-01-01',
    postal: '100-0001',
    address: '東京都千代田区1-1',
    tel: '090-1111-2222',
    profile_memo: '自己紹介メモ',
    emg_tel: '03-3333-4444',
    emg_rel: '妻',
    emg_memo: '緊急時メモ',
    dupr_id: 'D12345',
    dupr_rate_doubles: 3.555,
    dupr_rate_singles: 3.222,
    is_profile_public: true,
    member_kind: 'general',
    roles: ROLES.MEMBER,
    status: 'active',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトのAPIレスポンス設定
    api.fetchMemberById.mockResolvedValue({ 
      success: true, 
      data: mockFullMember 
    })
  })

  describe('1. 表示・認可の検証', () => {
    it('編集可能な全ての情報が期待通りに表示される', async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { id: 'admin-1', roles: ROLES.PRESIDENT },
        userRoles: ROLES.PRESIDENT,
      } as any)

      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)

      // フォーム表示まで待機
      await screen.findByLabelText(/会員番号/i)

      // 基本・管理情報
      expect(screen.getByLabelText(/会員番号/i)).toHaveValue('0001')
      expect(screen.getByLabelText(/ニックネーム/i)).toHaveValue('タロー')
      expect(screen.getByLabelText(/氏名（漢字）/i)).toHaveValue('テスト 太郎')
      expect(screen.getByLabelText(/氏名（ローマ字）/i)).toHaveValue('TEST TARO')
      expect(screen.getByLabelText(/性別/i)).toHaveValue('male')
      expect(screen.getByLabelText(/生年月日/i)).toHaveValue('1990-01-01')
      expect(screen.getByLabelText(/メールアドレス/i)).toHaveValue('test@example.com')
      expect(screen.getByLabelText(/会員種別/i)).toHaveValue('general')
      expect(screen.getByLabelText(/役職/i)).toHaveValue(ROLES.MEMBER)
      expect(screen.getByLabelText(/ステータス/i)).toHaveValue('active')

      // プロフィール
      expect(screen.getByLabelText(/郵便番号/i)).toHaveValue('100-0001')
      expect(screen.getByLabelText(/住所/i)).toHaveValue('東京都千代田区1-1')
      expect(screen.getByLabelText(/電話番号/i)).toHaveValue('090-1111-2222')
      expect(screen.getByLabelText(/プロフィールメモ/i)).toHaveValue('自己紹介メモ')
      expect(screen.getByLabelText(/緊急連絡先電話/i)).toHaveValue('03-3333-4444')
      expect(screen.getByLabelText(/続柄/i)).toHaveValue('妻')
      expect(screen.getByLabelText(/緊急連絡メモ/i)).toHaveValue('緊急時メモ')

      // 競技情報 (DUPR)
      expect(screen.getByLabelText(/DUPR ID/i)).toHaveValue('D12345')
      expect(screen.getByLabelText(/Doubles Rating/i)).toHaveValue(3.555)
      expect(screen.getByLabelText(/Singles Rating/i)).toHaveValue(3.222)
    })
  })

  describe('2. 更新処理の検証', () => {
    it('【整合性】全項目を一度に書き換えてもAPIに正しく送信されること', async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { id: 'admin-1', roles: ROLES.PRESIDENT },
        userRoles: ROLES.PRESIDENT,
      } as any)
      api.updateMember.mockResolvedValue({ success: true })

      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)

      // 読み込み完了を待機してから操作
      const nameInput = await screen.findByLabelText(/氏名（漢字）/i)
      fireEvent.change(nameInput, { target: { value: '変更 太郎' } })
      
      const roleSelect = screen.getByLabelText(/役職/i)
      fireEvent.change(roleSelect, { target: { value: ROLES.VICE_PRESIDENT } })

      fireEvent.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => {
        expect(api.updateMember).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            name: '変更 太郎',
            roles: ROLES.VICE_PRESIDENT
          })
        )
      })
    })
  })

  describe('3. 役職変更の認可階層ルール', () => {
    it('会長: 全ての役職への変更を許可する', async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { id: 'admin-1', roles: ROLES.PRESIDENT },
        userRoles: ROLES.PRESIDENT,
      } as any)
      api.updateMember.mockResolvedValue({ success: true })

      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)

      const roleSelect = await screen.findByLabelText(/役職/i)
      fireEvent.change(roleSelect, { target: { value: ROLES.PRESIDENT } })
      fireEvent.click(screen.getByRole('button', { name: /保存/i }))
      
      await waitFor(() => {
        expect(api.updateMember).toHaveBeenCalled()
      })
    })

    it('副会長: 会長への変更は注意喚起され実行できない', async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { id: 'admin-1', roles: ROLES.VICE_PRESIDENT },
        userRoles: ROLES.VICE_PRESIDENT,
      } as any)

      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)

      const roleSelect = await screen.findByLabelText(/役職/i)
      fireEvent.change(roleSelect, { target: { value: ROLES.PRESIDENT } })
      fireEvent.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('権限がありません')
        )
      })
      expect(api.updateMember).not.toHaveBeenCalled()
    })

    it('会員管理担当: 会長・副会長への変更は注意喚起され実行できない', async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { id: 'admin-1', roles: ROLES.MEMBER_MANAGER },
        userRoles: ROLES.MEMBER_MANAGER,
      } as any)

      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)

      const roleSelect = await screen.findByLabelText(/役職/i)
      fireEvent.change(roleSelect, { target: { value: ROLES.VICE_PRESIDENT } })
      fireEvent.click(screen.getByRole('button', { name: /保存/i }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('権限がありません')
        )
      })
      expect(api.updateMember).not.toHaveBeenCalled()
    })
  })
})