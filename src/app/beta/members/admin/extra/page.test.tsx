/**
 * Filename: src/app/members/admin/extra/page.test.tsx
 * Version : V3.0.0
 * Update  : 2026-02-01
 * Remarks :
 * V3.0.1 -ファイル位置をapp/admin/extraからapp/members/admin/extraに移動  
 * V3.0.0 -エキストラ管理ページの骨組み・物理削除セクション（ニックネーム＋メール指定）の検証。
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import AdminExtraPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import * as memberApi from '@/lib/memberApi'
import { ROLES } from '@/types/member'

vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi')

const mockReplace = vi.fn()
const mockConfirm = vi.fn()
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
    window.confirm = mockConfirm
  })

  it('管理者権限がない場合、会員プロフィールへリダイレクトする', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'u1', roles: [ROLES.MEMBER] },
      userRoles: [ROLES.MEMBER],
    } as any)

    render(<AdminExtraPage />)

    expect(mockReplace).toHaveBeenCalledWith('/members/profile')
  })

  it('管理者権限がある場合、ページタイトルと2つの機能セクションが表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
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
      user: { id: 'admin-1', roles: [ROLES.PRESIDENT] },
      userRoles: [ROLES.PRESIDENT],
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

  it('管理者権限がある場合、物理削除セクションにニックネーム・メールアドレス入力と削除ボタンが表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)

    render(<AdminExtraPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /不要会員の物理削除/i })
      ).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/ニックネーム/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /指定した会員を物理削除/i })
    ).toBeInTheDocument()
  })

  it('確認でキャンセルを選んだ場合、削除せず何もしない', async () => {
    mockConfirm.mockReturnValue(false)
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)

    render(<AdminExtraPage />)
    fireEvent.change(screen.getByLabelText(/ニックネーム/i), {
      target: { value: 'ヤマダ' },
    })
    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: 'a@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /指定した会員を物理削除/i }))

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('ニックネーム ヤマダ')
    )
    expect(memberApi.fetchMemberByNicknameAndEmail).not.toHaveBeenCalled()
    expect(memberApi.deleteMember).not.toHaveBeenCalled()
  })

  it('確認でOKを選んだ場合、会員を取得して参照チェック後に削除する', async () => {
    mockConfirm.mockReturnValue(true)
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)
    vi.mocked(memberApi.fetchMemberByNicknameAndEmail).mockResolvedValue({
      success: true,
      data: { id: 'u1', nickname: 'ヤマダ', email: 'a@example.com' } as any,
      error: null,
    })
    vi.mocked(memberApi.checkMemberReferenced).mockResolvedValue({
      success: true,
      data: { referenced: false },
      error: null,
    })
    vi.mocked(memberApi.deleteMember).mockResolvedValue({
      success: true,
      data: null,
      error: null,
    })

    render(<AdminExtraPage />)
    fireEvent.change(screen.getByLabelText(/ニックネーム/i), {
      target: { value: 'ヤマダ' },
    })
    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: 'a@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /指定した会員を物理削除/i }))

    await waitFor(() => {
      expect(memberApi.fetchMemberByNicknameAndEmail).toHaveBeenCalledWith(
        'ヤマダ',
        'a@example.com'
      )
    })
    expect(memberApi.checkMemberReferenced).toHaveBeenCalledWith('u1')
    expect(memberApi.deleteMember).toHaveBeenCalledWith('u1')
    await waitFor(() => {
      expect(screen.getByText(/削除しました/)).toBeInTheDocument()
    })
  })
})
