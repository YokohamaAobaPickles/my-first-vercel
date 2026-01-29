/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.3.3
 * Update  : 2026-01-30
 * Remarks : 
 * V2.3.3 - 統合：ユーザー様の V2.2.1 全ケースと、詳細表示・エラー検証を統合。
 * V2.3.3 - 修正：'緊急連絡先'ラベルの重複を避け、適切な role/text で取得。
 * V2.3.3 - 書式：80カラムラップ、並列判定の改行ルールを厳守。
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
import ProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  updateMemberStatus,
  deleteMember
} from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberStatus: vi.fn(),
  deleteMember: vi.fn(),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

const FULL_USER = {
  id: 'u123',
  nickname: 'テストユーザー',
  name: 'テスト 太郎',
  name_roma: 'Taro Test',
  member_number: 101,
  status: 'active',
  create_date: '2025-01-01',
  postal: '100-0001',
  address: '東京都千代田区',
  tel: '03-1111-2222',
  profile_memo: '自己紹介メモ',
  emg_tel: '090-9999-9999',
  emg_rel: '妻',
  emg_memo: '緊急時メモ',
  dupr_id: 'D-999',
  dupr_rate: '4.5'
}

describe('ProfilePage - 総合検証 V2.3.3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() }
    })
  })

  describe('1. 表示内容と権限の検証', () => {
    it('【詳細表示】基本・プロフ・競技情報がすべて表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: FULL_USER,
        userRoles: 'member',
      })
      render(<ProfilePage />)
      expect(screen.getByText('0101')).toBeInTheDocument()
      expect(screen.getByText('東京都千代田区')).toBeInTheDocument()
      expect(screen.getByText('03-1111-2222')).toBeInTheDocument()
      expect(screen.getByText('妻')).toBeInTheDocument()
      expect(screen.getByText('D-999')).toBeInTheDocument()
    })

    it('【管理者】会員管理パネルの表示がロールで制御されること', () => {
      const { rerender } = render(<ProfilePage />)
      
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: FULL_USER,
        userRoles: 'member_manager',
      })
      rerender(<ProfilePage />)
      expect(screen.getByText('会員管理パネル')).toBeInTheDocument()

      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: FULL_USER,
        userRoles: 'member',
      })
      rerender(<ProfilePage />)
      expect(screen.queryByText('会員管理パネル')).not.toBeInTheDocument()
    })
  })

  describe('2. ステータス別ボタン表示の出し分け', () => {
    const testCases = [
      { 
        status: 'new_req', 
        show: ['入会取消'], 
        hide: ['休会申請', '退会申請'] 
      },
      { 
        status: 'active', 
        show: ['休会申請', '退会申請'], 
        hide: ['入会取消'] 
      },
      { 
        status: 'suspend_req', 
        show: ['休会取消', '退会申請'], 
        hide: ['休会申請'] 
      },
      { 
        status: 'withdraw_req', 
        show: ['退会取消'], 
        hide: ['休会申請', '退会申請'] 
      },
      { 
        status: 'withdrawn', 
        show: [], 
        hide: ['休会申請', '退会申請', '入会取消'] 
      }
    ]

    testCases.forEach(({ status, show, hide }) => {
      it(`【ステータス: ${status}】期待通りのボタンが表示されること`, () => {
        ;(useAuthCheck as any).mockReturnValue({
          isLoading: false,
          user: { ...FULL_USER, status },
          userRoles: 'member',
        })
        render(<ProfilePage />)
        show.forEach(name => 
          expect(screen.getByRole('button', { name })).toBeInTheDocument())
        hide.forEach(name => 
          expect(screen.queryByRole('button', { name })).not.toBeInTheDocument())
      })
    })
  })

  describe('3. アクション実行とAPI連携', () => {
    it('【入会取消】deleteMember 実行後にTOPへ遷移すること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...FULL_USER, status: 'new_req' },
        userRoles: 'member',
      })
      vi.mocked(deleteMember).mockResolvedValue({ success: true, data: null, error: null })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '入会取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(deleteMember).toHaveBeenCalledWith(FULL_USER.id)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('【申請取消】取消実行時に status が active に戻ること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...FULL_USER, status: 'suspend_req' },
        userRoles: 'member',
      })
      vi.mocked(updateMemberStatus).mockResolvedValue({ success: true, data: null, error: null })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '休会取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(FULL_USER.id, 'active')
      })
    })

    it('【異常系】API失敗時にエラー内容がアラート表示されること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...FULL_USER, status: 'active' },
        userRoles: 'member',
      })
      vi.mocked(updateMemberStatus).mockResolvedValue({
        success: false,
        data: null,
        error: { message: 'DBエラー' }
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '休会申請' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('エラー: DBエラー')
      })
    })
  })
})