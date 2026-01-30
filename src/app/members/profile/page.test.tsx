/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.6.1
 * Update  : 2026-01-31
 * Remarks : 
 * V2.6.1 - 修正：キー名を dupr_rate_doubles / singles に統一。
 * V2.6.1 - 復元：休会・退会申請の API 連携テストを再追加。
 * V2.6.1 - 検証：アクション実行後の window.location.reload 呼び出しを確認。
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
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// Alert & Reload モック
vi.spyOn(window, 'alert').mockImplementation(() => { })
const mockReload = vi.fn()

const TEST_USER = {
  id: 'u123',
  nickname: 'たろう',
  name: '山田 太郎',
  member_number: '0101',
  status: 'active',
  address: '東京都千代田区',
  emg_rel: '父',
  dupr_id: 'WKRV2Q',
  dupr_rate_doubles: 4.567,
  dupr_rate_singles: 2.512,
}

describe('ProfilePage 総合検証 V2.6.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // window.location.reload をモック化
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: mockReload }
    })
  })

  describe('1. 競技情報 (DUPR) の検証', () => {
    it('【表示】Ratingが表示され、手動更新の案内があること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      render(<ProfilePage />)
      
      expect(screen.getByText('WKRV2Q')).toBeInTheDocument()
      expect(screen.getByText('4.567')).toBeInTheDocument()
      expect(screen.getByText('2.512')).toBeInTheDocument()
      
      // 更新ボタンがないことと、案内文の確認
      expect(screen.queryByRole('button', { name: 'DUPR更新' }))
        .not.toBeInTheDocument()
      expect(screen.getByText(/情報の変更はプロフィール編集から/))
        .toBeInTheDocument()
    })
  })

  describe('2. アクション実行とAPI連携', () => {
    it('【休会申請】実行後にAPIが呼ばれ、画面がリロードされること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'active' },
        userRoles: 'member',
      })
      vi.mocked(updateMemberStatus).mockResolvedValue({ 
        success: true, data: null, error: null 
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '休会申請' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(
          TEST_USER.id, 
          'suspend_req'
        )
        expect(mockReload).toHaveBeenCalled()
      })
    })

    it('【退会申請】実行後にAPIが呼ばれ、画面がリロードされること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'active' },
        userRoles: 'member',
      })
      vi.mocked(updateMemberStatus).mockResolvedValue({ 
        success: true, data: null, error: null 
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '退会申請' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(
          TEST_USER.id, 
          'withdraw_req'
        )
        expect(mockReload).toHaveBeenCalled()
      })
    })

    it('【入会取消】deleteMember 実行後にTOPへ遷移すること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'new_req' },
        userRoles: 'member',
      })
      vi.mocked(deleteMember).mockResolvedValue({ 
        success: true, data: null, error: null 
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '入会取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(deleteMember).toHaveBeenCalledWith(TEST_USER.id)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })
})