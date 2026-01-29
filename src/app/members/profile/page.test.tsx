/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.5.0
 * Update  : 2026-01-30
 * Remarks : 
 * V2.5.0 - 統合：休会・退会等の申請テストと、DUPR分離表示・更新テストを統合。
 * V2.5.0 - 修正：未定義変数(FULL_USER)の解消、期待される失敗の定義。
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
  deleteMember,
  syncDuprData
} from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberStatus: vi.fn(),
  deleteMember: vi.fn(),
  syncDuprData: vi.fn(),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}))

// Alertのグローバルモック
const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { })

const TEST_USER = {
  id: 'u123',
  nickname: 'たろう',
  name: '山田 太郎',
  name_roma: 'Taro Yamada',
  member_number: '0101',
  status: 'active',
  gender: '男性',
  birthday: '1990-01-01',
  tel: '03-1234-5678',
  postal: '100-0001',
  address: '東京都千代田区',
  create_date: '2025-01-01T00:00:00Z',
  emg_tel: '03-9999-8888',
  emg_rel: '父',
  emg_memo: '持病なし',
  dupr_id: 'D-123',
  dupr_rate: 4.567,       // Doubles
  dupr_singles: 2.512,    // Singles
}

describe('ProfilePage 総合検証 V2.5.0', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // location.reload のモック化
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() }
    })
  })

  describe('1. 表示内容と権限の検証', () => {
    it('【詳細表示】基本情報・緊急連絡先が表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      render(<ProfilePage />)
      expect(screen.getByText('0101')).toBeInTheDocument()
      expect(screen.getByText('東京都千代田区')).toBeInTheDocument()
      expect(screen.getByText('父')).toBeInTheDocument()
    })

    it('【管理者】会員管理パネルの表示がロールで制御されること', () => {
      const { rerender } = render(<ProfilePage />)
      
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member_manager',
      })
      rerender(<ProfilePage />)
      expect(screen.getByText('会員管理パネル')).toBeInTheDocument()

      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      rerender(<ProfilePage />)
      expect(screen.queryByText('会員管理パネル')).not.toBeInTheDocument()
    })
  })

  describe('2. 競技情報 (DUPR) の検証', () => {
    it('【表示】DoublesとSinglesのRatingが分離して表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      render(<ProfilePage />)
      expect(screen.getByText('D-123')).toBeInTheDocument()
      expect(screen.getByText('4.567')).toBeInTheDocument()
      expect(screen.getByText('2.512')).toBeInTheDocument()
    })

    it('【同期】DUPR更新ボタン押下で syncDuprData が呼ばれること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member',
      })
      vi.mocked(syncDuprData).mockResolvedValue({ 
        success: true, 
        data: null, 
        error: null 
      })

      render(<ProfilePage />)
      const syncBtn = screen.getByRole('button', { name: 'DUPR更新' })
      fireEvent.click(syncBtn)

      await waitFor(() => {
        expect(syncDuprData).toHaveBeenCalledWith(TEST_USER.id)
        expect(window.location.reload).toHaveBeenCalled()
      })
    })
  })

  describe('3. ステータス別ボタン表示の出し分け', () => {
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
      }
    ]

    testCases.forEach(({ status, show, hide }) => {
      it(`【ステータス: ${status}】期待通りのボタンが表示されること`, () => {
        ;(useAuthCheck as any).mockReturnValue({
          isLoading: false,
          user: { ...TEST_USER, status },
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

  describe('4. アクション実行とAPI連携', () => {
    it('【入会取消】deleteMember 実行後にTOPへ遷移すること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'new_req' },
        userRoles: 'member',
      })
      vi.mocked(deleteMember).mockResolvedValue({ 
        success: true, 
        data: null, 
        error: null 
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '入会取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(deleteMember).toHaveBeenCalledWith(TEST_USER.id)
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('【申請取消】取消実行時に status が active に戻ること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, status: 'suspend_req' },
        userRoles: 'member',
      })
      vi.mocked(updateMemberStatus).mockResolvedValue({ 
        success: true, 
        data: null, 
        error: null 
      })

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '休会取消' }))
      fireEvent.click(screen.getByRole('button', { name: '実行する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith(TEST_USER.id, 'active')
      })
    })
  })
})