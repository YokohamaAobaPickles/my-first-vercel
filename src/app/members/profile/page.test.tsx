/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V2.8.0
 * Update  : 2026-01-31
 * Remarks : 
 * V2.8.0 - 統合：非同期UI（処理中状態）やガード処理の検証を強化。
 * V2.8.0 - 網羅：全表示項目（メモ、DUPR、ログアウト等）の検証を継続。
 * V2.8.0 - 修正：APIパスをプロジェクト構成 (@/lib/memberApi) に合わせ修正。
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import ProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { updateMemberStatus, deleteMember } from '@/lib/memberApi'

vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberStatus: vi.fn(),
  deleteMember: vi.fn(),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}))

const mockReload = vi.fn()
const TEST_USER = {
  id: 'u123',
  nickname: 'たろう',
  name: '山田 太郎',
  name_roma: 'Taro Yamada',
  member_number: '1005',
  status: 'active',
  gender: '男性',
  birthday: '1990-01-01',
  postal: '100-0001',
  address: '東京都千代田区',
  tel: '03-1234-5678',
  emg_rel: '家族',
  emg_tel: '080-5026-2247',
  profile_memo: 'テニス歴10年です。',
  emg_memo: '怪我しがち',
  dupr_id: 'WKRV2Q',
  dupr_rate_doubles: 4.567,
  dupr_rate_singles: 2.512,
  dupr_updated_at: '2026-01-20',
  create_date: '2026-01-01',
}

describe('ProfilePage 統合検証 V2.8.0', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: mockReload }
    })
    vi.spyOn(window, 'alert').mockImplementation(() => { })
  })

  /* --------------------
   * ガード・初期表示
   * -------------------- */
  it('ローディング中は「読み込み中...」が表示される', () => {
    ; (useAuthCheck as any).mockReturnValue({ isLoading: true })
    render(<ProfilePage />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('ユーザー不在時はエラーメッセージが表示される', () => {
    ; (useAuthCheck as any).mockReturnValue({ isLoading: false, user: null })
    render(<ProfilePage />)
    expect(screen.getByText('ユーザー情報が見つかりません。')).toBeInTheDocument()
  })

  /* --------------------
   * 表示項目の網羅性 (要件検証)
   * -------------------- */
  it('全てのプロフィール項目（メモ、DUPR等）が表示される', () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false, user: TEST_USER, userRoles: 'member'
    })
    render(<ProfilePage />)
    expect(screen.getByText('たろう')).toBeInTheDocument()
    expect(screen.getByText('テニス歴10年です。')).toBeInTheDocument()
    expect(screen.getByText('怪我しがち')).toBeInTheDocument()
    expect(screen.getByText('4.567')).toBeInTheDocument()
    expect(screen.getByText('2026-01-20')).toBeInTheDocument()
    //expect(screen.getByRole('link', { name: 'ログアウト' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
  })

  /* --------------------
   * ステータス別ボタン・アクション
   * -------------------- */
  it('【新規入会申請】ステータス表示と入会取消(deleteMember)の連動', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false, user: { ...TEST_USER, status: 'new_req' }, userRoles: 'member'
    })
    vi.mocked(deleteMember).mockResolvedValue({ success: true, data: null, error: null })

    render(<ProfilePage />)
    expect(screen.getByText('入会申請中')).toBeInTheDocument()

    fireEvent.click(screen.getByText('入会取消'))
    fireEvent.click(screen.getByRole('button', { name: '実行する' }))

    await waitFor(() => {
      expect(deleteMember).toHaveBeenCalledWith(TEST_USER.id)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('【休会申請】ステータス変更(updateMemberStatus)とリロード', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false, user: TEST_USER, userRoles: 'member'
    })
    vi.mocked(updateMemberStatus).mockResolvedValue({ success: true, data: null, error: null })

    render(<ProfilePage />)
    fireEvent.click(screen.getByText('休会申請'))
    fireEvent.click(screen.getByRole('button', { name: '実行する' }))

    await waitFor(() => {
      expect(updateMemberStatus).toHaveBeenCalledWith(TEST_USER.id, 'suspend_req')
      expect(mockReload).toHaveBeenCalled()
    })
  })

  /* --------------------
   * 非同期・エラーUI
   * -------------------- */
  it('API失敗時は alert が表示される', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false, user: TEST_USER, userRoles: 'member'
    })
    vi.mocked(updateMemberStatus).mockResolvedValue({
      success: false,
      data: null,
      error: { message: '通信エラー' }
    })

    render(<ProfilePage />)
    fireEvent.click(screen.getByText('休会申請'))
    fireEvent.click(screen.getByRole('button', { name: '実行する' }))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('通信エラー')
    })
  })

  it('実行中は「処理中...」が表示され、ボタンが無効になる', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false, user: TEST_USER, userRoles: 'member'
    })
    let resolveFn: any
    vi.mocked(updateMemberStatus).mockReturnValue(
      new Promise(res => { resolveFn = res }) as any
    )

    render(<ProfilePage />)
    fireEvent.click(screen.getByText('休会申請'))
    fireEvent.click(screen.getByRole('button', { name: '実行する' }))

    expect(screen.getByText('処理中...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()

    resolveFn({ success: true, data: null, error: null })
  })
})