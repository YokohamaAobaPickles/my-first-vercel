/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.7.1
 * Update  : 2026-01-31
 * Remarks : 
 * V2.7.1 - 強化：ステータス別のボタン出し分け（新規入会、申請中）を網羅。
 * V2.7.1 - 強化：申請取消時のAPI連携および注意喚起メッセージの検証を追加。
 * V2.7.1 - 強化：退会・取消実行後のリロード・遷移検証を網羅。
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

vi.spyOn(window, 'alert').mockImplementation(() => { })
const mockReload = vi.fn()

const TEST_USER = {
  id: 'u123',
  nickname: 'たろう',
  name: '山田 太郎',
  member_number: '1005',
  status: 'active',
  address: '東京都千代田区',
  postal: '100-0001',
  tel: '03-1234-5678',
  emg_rel: '家族',
  emg_tel: '080-5026-2247',
  dupr_id: 'WKRV2Q',
  dupr_rate_doubles: 4.567,
  dupr_rate_singles: 2.512,
  dupr_updated_at: '2026-01-20',
}

describe('ProfilePage 総合検証 V2.7.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: mockReload }
    })
  })

  describe('1. レイアウトとボタン表示の検証', () => {
    it('【管理者】ヘッダー右側に「会員管理パネル」が表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member_manager',
      })
      render(<ProfilePage />)
      expect(screen.getByText('会員管理パネル')).toBeInTheDocument()
    })

    it('【有効会員】基本情報に休会・退会ボタンがあり、プロフィールに編集があること',
      () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'active' },
        userRoles: 'member',
      })
      render(<ProfilePage />)
      const basicSec = screen.getByText('基本情報').closest('section')
      expect(basicSec).toHaveTextContent('休会申請')
      expect(basicSec).toHaveTextContent('退会申請')
      
      const profSec = screen.getByText('プロフィール').closest('section')
      expect(profSec).toHaveTextContent('編集')
    })

    it('【新規入会申請者】「入会取消」のみが表示され、休会・退会は出ないこと',
      () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'new_req' },
        userRoles: 'member',
      })
      render(<ProfilePage />)
      const basicSec = screen.getByText('基本情報').closest('section')
      expect(basicSec).toHaveTextContent('入会取消')
      expect(basicSec).not.toHaveTextContent('休会申請')
      expect(basicSec).not.toHaveTextContent('退会申請')
    })
  })

  describe('2. 競技情報の検証', () => {
    it('DUPR ID、レート、登録日が正しく表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      render(<ProfilePage />)
      expect(screen.getByText('WKRV2Q')).toBeInTheDocument()
      expect(screen.getByText('4.567')).toBeInTheDocument()
      expect(screen.getByText('2026-01-20')).toBeInTheDocument()
    })
  })

  describe('3. アクション実行の検証', () => {
    beforeEach(() => {
      vi.mocked(updateMemberStatus).mockResolvedValue({
        success: true, data: null, error: null
      })
      vi.mocked(deleteMember).mockResolvedValue({
        success: true, data: null, error: null
      })
    })

    it('【退会申請】実行後にAPIが呼ばれ、画面がリロードされること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'active' },
        userRoles: 'member',
      })
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '退会申請' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(TEST_USER.id, 'withdraw_req')
        expect(mockReload).toHaveBeenCalled()
      })
    })

    it('【入会取消】注意喚起メッセージが表示され、実行後にTOPへ遷移すること', 
      async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'new_req' },
        userRoles: 'member',
      })
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '入会取消' }))
      
      // 注意喚起メッセージの確認
      expect(screen.getByText(/登録情報を完全に削除します/)).toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(deleteMember).toHaveBeenCalledWith(TEST_USER.id)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('【申請取消】休会申請中からactiveに戻り、リロードされること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'suspend_req' },
        userRoles: 'member',
      })
      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '申請取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(TEST_USER.id, 'active')
        expect(mockReload).toHaveBeenCalled()
      })
    })
  })
})