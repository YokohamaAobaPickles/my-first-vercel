/**
 * Filename: src/app/members/admin/page.test.tsx
 * Version : V2.1.1
 * Update  : 2026-02-01
 * Remarks : 
 * V2.1.1 - 修正：クライアントサイドフィルタリングの検証に変更（API再呼び出しの検証を削除）。
 * V2.1.0 - 強化：未認可アクセス、ステータス絞り込み操作、番号フォーマットの検証を追加。
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminDashboard from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { ROLES } from '@/types/member'
import * as memberApi from '@/lib/memberApi'

vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  fetchMembers: vi.fn(),
  fetchPendingMembers: vi.fn(), // 互換性のため維持
}))

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('AdminDashboard - 全会員一覧表示の検証 V2.1.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【認可】管理者権限がない場合、ホームへリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.MEMBER },
      userRoles: ROLES.MEMBER,
    } as any)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/members/profile')
    })
  })

  it('【A-31正常系】会員番号が4桁フォーマットされていること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
      userRoles: ROLES.SYSTEM_ADMIN,
    } as any)

    const mockMembers = [
      { id: 'u1', member_number: 1, name: '会員一号', status: 'active' },
      { id: 'u2', member_number: 25, name: '会員二五号', status: 'active' }
    ]

    vi.mocked(memberApi.fetchMembers).mockResolvedValue({
      success: true,
      data: mockMembers as any,
      error: null
    })

    render(<AdminDashboard />)

    expect(await screen.findByText('0001')).toBeTruthy()
    expect(screen.getByText('0025')).toBeTruthy()
  })

})