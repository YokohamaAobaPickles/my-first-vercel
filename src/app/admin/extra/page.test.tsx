/**
 * Filename: src/app/admin/extra/page.test.tsx
 * Version : V2.0.0
 * Update  : 2026-02-01
 * Remarks : エキストラ管理ページの骨組み・物理削除セクションの検証。V2.0.0 で memberApi モック追加。
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import AdminExtraPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import * as memberApi from '@/lib/memberApi'
import { ROLES } from '@/types/member'

vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

describe('AdminExtraPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(memberApi.fetchMembers).mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })
  })

  it('管理者権限がない場合、会員プロフィールへリダイレクトする', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'u1', roles: ROLES.MEMBER },
      userRoles: ROLES.MEMBER,
    } as any)

    render(<AdminExtraPage />)

    expect(mockReplace).toHaveBeenCalledWith('/members/profile')
  })

  it('管理者権限がある場合、ページタイトルと2つの機能セクションが表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: ROLES.SYSTEM_ADMIN },
      userRoles: ROLES.SYSTEM_ADMIN,
    } as any)

    render(<AdminExtraPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /エキストラ管理/i })
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('heading', { name: /DUPR技術レベルの一括登録/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /不要会員の物理削除/i })
    ).toBeInTheDocument()
  })

  it('会員管理パネルへ戻るリンクが表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: ROLES.PRESIDENT },
      userRoles: ROLES.PRESIDENT,
    } as any)

    render(<AdminExtraPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /会員管理パネルへ戻る/i })
      ).toBeInTheDocument()
    })
    const backLink = screen.getByRole('link', {
      name: /会員管理パネルへ戻る/i,
    })
    expect(backLink).toHaveAttribute('href', '/members/admin')
  })

  it('管理者権限がある場合、物理削除セクションに会員一覧または0件メッセージが表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: ROLES.SYSTEM_ADMIN },
      userRoles: ROLES.SYSTEM_ADMIN,
    } as any)
    vi.mocked(memberApi.fetchMembers).mockResolvedValue({
      success: true,
      data: [],
      error: null,
    })

    render(<AdminExtraPage />)

    await waitFor(() => {
      expect(screen.getByText(/会員が0件です/)).toBeInTheDocument()
    })
  })

  it('管理者権限がある場合、物理削除セクションで fetchMembers が呼ばれる', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: ROLES.SYSTEM_ADMIN },
      userRoles: ROLES.SYSTEM_ADMIN,
    } as any)

    render(<AdminExtraPage />)

    await waitFor(() => {
      expect(memberApi.fetchMembers).toHaveBeenCalled()
    })
  })
})
