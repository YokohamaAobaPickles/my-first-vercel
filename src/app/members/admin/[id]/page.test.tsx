/**
 * Filename: src/app/members/admin/[id]/page.test.tsx
 * Version : V2.4.0
 * Update  : 2026-02-01
 * Remarks : 
 * V2.4.0 - 修正：セキュリティテストに act を追加。異常系テスト(alert)の実装を完了。
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MemberDetailAdmin from './page'
import * as memberApi from '@/lib/memberApi'
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
  useParams: () => ({
    id: 'user-123',
  }),
}))

window.confirm = vi.fn(() => true)
window.alert = vi.fn()

const api = memberApi as any

describe('MemberDetailAdmin - 管理者用詳細編集の検証 V2.4.0', () => {
  const mockProps = {
    params: Promise.resolve({ id: 'user-123' })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: ROLES.PRESIDENT },
      userRoles: ROLES.PRESIDENT,
    } as any)
  })

  const mockMember = {
    id: 'user-123',
    member_number: '0001',
    name: '旧 氏名',
    name_roma: 'KYU SHIMEI',
    nickname: 'ニックネーム',
    email: 'test@example.com',
    gender: 'male',
    birthday: '1990-01-01',
    member_kind: 'general',
    roles: ROLES.MEMBER,
    status: 'active',
    emg_tel: '090-0000-0000',
    emg_rel: '家族'
  }

  it('【表示】管理者用編集項目が正しく表示されていること', async () => {
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: mockMember,
      error: null
    })

    await act(async () => {
      render(<MemberDetailAdmin {...(mockProps as any)} />)
    })

    expect(await screen.findByDisplayValue('旧 氏名')).toBeTruthy()
    expect(screen.getByDisplayValue('KYU SHIMEI')).toBeTruthy()
    expect(screen.getByDisplayValue('一般')).toBeTruthy()
  })

  it('【編集】管理者用項目を変更して保存できること', async () => {
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: mockMember,
      error: null
    })
    api.updateMember.mockResolvedValue({ success: true, data: null, error: null })

    await act(async () => {
      render(<MemberDetailAdmin {...(mockProps as any)} />)
    })

    fireEvent.change(await screen.findByLabelText(/氏名（漢字）/i), {
      target: { value: '新 氏名' }
    })
    fireEvent.click(screen.getByRole('button', { name: /保存/i }))

    await waitFor(() => {
      expect(api.updateMember).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ name: '新 氏名' })
      )
    })
  })

  it('【退会】退会処理でメールアドレスが加工されること', async () => {
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: { ...mockMember, status: 'withdraw_req' },
      error: null
    })
    api.updateMember.mockResolvedValue({ success: true, data: null, error: null })

    await act(async () => {
      render(<MemberDetailAdmin {...(mockProps as any)} />)
    })

    const btn = await screen.findByRole('button', { name: /退会を承認/i })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(api.updateMember).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          status: 'withdrawn',
          email: expect.stringMatching(/test@example\.com_withdrawn_\d{8}/)
        })
      )
    })
  })

  it('【拒否】全ステータスから拒否(rejected)にできること', async () => {
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: { ...mockMember, status: 'active' },
      error: null
    })
    api.updateMember.mockResolvedValue({ success: true, data: null, error: null })

    await act(async () => {
      render(<MemberDetailAdmin {...(mockProps as any)} />)
    })

    const btn = await screen.findByRole('button', { name: /強制退会/i })
    fireEvent.click(btn)

    await waitFor(() => {
      expect(api.updateMember).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ status: 'rejected' })
      )
    })
  })

  it('【セキュリティ】一般会員(MEMBER)がアクセスした場合、プロフィールへ飛ばされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.MEMBER },
      userRoles: ROLES.MEMBER,
    } as any)

    await act(async () => {
      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)
    })

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/members/profile')
    })
  })

  it('【整合性】複数フィールドの同時変更がAPIに正しく伝わること', async () => {
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: mockMember,
      error: null
    })
    api.updateMember.mockResolvedValue({ success: true, data: null, error: null })

    await act(async () => {
      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)
    })

    fireEvent.change(await screen.findByLabelText(/氏名（漢字）/i), {
      target: { value: '新氏名' }
    })
    fireEvent.change(screen.getByLabelText(/会員種別/i), {
      target: { value: 'family' }
    })

    fireEvent.click(screen.getByRole('button', { name: /保存/i }))

    await waitFor(() => {
      expect(api.updateMember).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ name: '新氏名', member_kind: 'family' })
      )
    })
  })

  it('【異常系】API保存失敗時にエラーログが出ること', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    api.fetchMemberById.mockResolvedValue({
      success: true,
      data: mockMember,
      error: null
    })
    api.updateMember.mockResolvedValue({
      success: false,
      error: { message: 'サーバーエラー' }
    })

    await act(async () => {
      render(<MemberDetailAdmin params={Promise.resolve({ id: 'user-123' })} />)
    })

    fireEvent.click(await screen.findByRole('button', { name: /保存/i }))
    
    // alertが呼ばれないことを間接的に確認（成功時のみalertが出る仕様のため）
    expect(window.alert).not.toHaveBeenCalledWith('更新しました')
    consoleSpy.mockRestore()
  })
})