/**
 * Filename: src/app/members/extra/dupr/page.test.tsx
 * Version : V1.0.1
 * Update  : 2026-02-02
 * Remarks : 
 * V1.0.1 - ファイル位置をsrc/app/members/extra/dupr/に移動
 * V1.0.0 - DUPR一括登録ページの表示・権限・結果表示の検証
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import MembersExtraPage from './page'
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

describe('MembersExtraPage (DUPR一括登録)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('管理権限がない場合、会員プロフィールへリダイレクトする', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'u1', roles: [ROLES.MEMBER] },
      userRoles: [ROLES.MEMBER],
    } as any)

    render(<MembersExtraPage />)

    expect(mockReplace).toHaveBeenCalledWith('/members/profile')
  })

  it('管理権限がある場合、タイトル・戻るリンク・アップロード説明が表示される', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)

    render(<MembersExtraPage />)

    expect(
      screen.getByRole('heading', { name: /DUPR一括登録/i })
    ).toBeInTheDocument()
    const backLink = screen.getByRole('link', {
      name: /エキストラ管理へ戻る/i,
    })
    expect(backLink).toHaveAttribute('href', '/members/admin/extra')
    expect(
      screen.getByText(/書式: 氏名 \/ DUPR ID \/ 住所/)
    ).toBeInTheDocument()
    expect(screen.getByText(/ファイルを選択/)).toBeInTheDocument()
  })

  it('ファイル選択後、該当会員がいなければスキップとして結果に表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.MEMBER_MANAGER] },
      userRoles: [ROLES.MEMBER_MANAGER],
    } as any)
    vi.mocked(memberApi.fetchMemberByDuprId).mockResolvedValue({
      success: true,
      data: null,
      error: null,
    })

    const fileContent = `Tomo Yamashita
WKRV2Q
Yokohama, Kanagawa, JP
• M
2.26
NR
`
    const file = new File([fileContent], 'dupr.txt', { type: 'text/plain' })
    if (typeof file.text !== 'function') {
      (file as any).text = () => Promise.resolve(fileContent)
    }

    render(<MembersExtraPage />)

    const input = screen.getByLabelText(/DUPRファイルを選択/i)
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /更新結果/i })
      ).toBeInTheDocument()
    })

    expect(screen.getByText(/スキップ: 1 件/)).toBeInTheDocument()
    expect(
      screen.getByText(/該当する会員が存在しません/)
    ).toBeInTheDocument()
  })

  it('該当会員がいる場合、更新済として結果に表示される', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)
    vi.mocked(memberApi.fetchMemberByDuprId).mockResolvedValue({
      success: true,
      data: {
        id: 'member-uuid-1',
        dupr_id: 'WKRV2Q',
        name: 'Tomo Yamashita',
      } as any,
      error: null,
    })
    vi.mocked(memberApi.updateMember).mockResolvedValue({
      success: true,
      data: null,
      error: null,
    })

    const fileContent = `Tomo Yamashita
WKRV2Q
Yokohama, Kanagawa, JP
• M
2.26
NR
`
    const file = new File([fileContent], 'dupr.txt', { type: 'text/plain' })
    if (typeof file.text !== 'function') {
      (file as any).text = () => Promise.resolve(fileContent)
    }

    render(<MembersExtraPage />)

    const input = screen.getByLabelText(/DUPRファイルを選択/i)
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText(/更新: 1 件/)).toBeInTheDocument()
    })

    expect(screen.getByText(/更新済/)).toBeInTheDocument()
    expect(
      screen.getByText(/Doubles 2.26 \/ Singles 0 で更新/)
    ).toBeInTheDocument()
  })

  it('同一 DUPR ID が複数会員に登録されている場合は更新せずエラー理由を表示する', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1', roles: [ROLES.SYSTEM_ADMIN] },
      userRoles: [ROLES.SYSTEM_ADMIN],
    } as any)
    vi.mocked(memberApi.fetchMemberByDuprId).mockResolvedValue({
      success: false,
      data: null,
      error: {
        message:
          '同一のDUPR IDが複数会員に登録されています。重複を解消してから再度実行してください。',
        code: 'DUPLICATE_DUPR_ID',
      },
    })

    const fileContent = `Tomo Yamashita
WKRV2Q
Yokohama, Kanagawa, JP
• M
2.26
NR
`
    const file = new File([fileContent], 'dupr.txt', { type: 'text/plain' })
    if (typeof file.text !== 'function') {
      (file as any).text = () => Promise.resolve(fileContent)
    }

    render(<MembersExtraPage />)

    const input = screen.getByLabelText(/DUPRファイルを選択/i)
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /更新結果/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/エラー: 1 件/)).toBeInTheDocument()
    expect(
      screen.getByText(/同一のDUPR IDが複数会員に登録されています/)
    ).toBeInTheDocument()
  })
})
