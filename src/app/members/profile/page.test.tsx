/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.1.3
 * Update  : 2026-01-30
 * Remarks : 
 * V2.1.3 - 拡充：基本情報、プロフィール、競技情報の全項目表示テストを追加。
 * V2.1.3 - 拡充：管理者パネル、休会/退会、編集ボタンの存在確認を追加。
 * V2.1.3 - 修正：'緊急連絡先'の重複問題に対応するため getAllByText を使用。
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
import ProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { updateMemberStatus } from '@/lib/memberApi'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ProfilePage - 総合表示・権限検証 V2.1.3', () => {
  const TEST_USER = {
    id: 'u123',
    member_number: 1,
    nickname: 'たろう',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    gender: '男性',
    birthday: '1990-01-01',
    status: 'active',
    create_date: '2025-01-01',
    postal: '123-4567',
    address: '東京都渋谷区',
    tel: '090-0000-0000',
    profile_memo: 'テニスが好きです',
    emg_tel: '03-9999-9999',
    emg_rel: '妻',
    emg_memo: 'アレルギーあり',
    dupr_id: 'D-123',
    dupr_rate: '3.55',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // window.location.reload のモック
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    })
  })

  describe('1. 表示内容の網羅的検証', () => {
    beforeEach(() => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'general',
      })
    })

    it('【基本情報】すべての項目が正しく表示されること', () => {
      render(<ProfilePage />)
      expect(screen.getByText('0001')).toBeTruthy()
      expect(screen.getByText('たろう')).toBeTruthy()
      expect(screen.getByText('山田 太郎')).toBeTruthy()
      expect(screen.getByText('Taro Yamada')).toBeTruthy()
      expect(screen.getByText('男性')).toBeTruthy()
      expect(screen.getByText('1990-01-01')).toBeTruthy()
      expect(screen.getByText('有効')).toBeTruthy()
    })

    it('【プロフィール】連絡先と緊急連絡先が正しく表示されること', () => {
      render(<ProfilePage />)
      expect(screen.getByText('123-4567')).toBeTruthy()
      expect(screen.getByText('東京都渋谷区')).toBeTruthy()
      expect(screen.getByText('090-0000-0000')).toBeTruthy()
      expect(screen.getByText('テニスが好きです')).toBeTruthy()
      
      // 緊急連絡先セクション（重複対策）
      expect(screen.getAllByText('緊急連絡先').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('03-9999-9999')).toBeTruthy()
      expect(screen.getByText('妻')).toBeTruthy()
      expect(screen.getByText('アレルギーあり')).toBeTruthy()
    })

    it('【競技情報】DUPR情報が正しく表示されること', () => {
      render(<ProfilePage />)
      expect(screen.getByText('D-123')).toBeTruthy()
      expect(screen.getByText('3.55')).toBeTruthy()
    })
  })

  describe('2. UI要素とボタンの配置検証', () => {
    it('【管理者権限】管理者パネルボタンが表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'member_manager',
      })
      render(<ProfilePage />)
      // タイトルの横にリンクボタンが存在するか
      expect(screen.getByRole('link', { name: '会員管理パネル' })).toBeTruthy()
    })

    it('【申請ボタン】基本情報内に休会・退会申請ボタンが表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'general',
      })
      render(<ProfilePage />)
      expect(screen.getByRole('button', { name: '休会申請' })).toBeTruthy()
      expect(screen.getByRole('button', { name: '退会申請' })).toBeTruthy()
    })

    it('【編集ボタン】プロフィール内に編集ボタンが表示されること', () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'general',
      })
      render(<ProfilePage />)
      // 編集ボタンをロールで特定
      expect(screen.getByRole('button', { name: '編集' })).toBeTruthy()
    })
  })

  describe('3. 申請アクションの検証', () => {
    it('【休会】申請フローが正常に動作すること', async () => {
      ;(useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'general',
      })
      ;(updateMemberStatus as any).mockResolvedValue({ success: true })
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<ProfilePage />)
      fireEvent.click(screen.getByRole('button', { name: '休会申請' }))
      fireEvent.click(screen.getByRole('button', { name: '送信する' }))

      await waitFor(() => {
        expect(updateMemberStatus).toHaveBeenCalledWith('u123', 'suspend_req')
        expect(alertMock).toHaveBeenCalledWith('申請を受け付けました。')
      })
    })
  })
})