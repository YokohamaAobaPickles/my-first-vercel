/**
 * Filename: src/app/members/admin/page.test.tsx
 * Version : V2.2.2
 * Update  : 2026-02-02
 * Remarks :
 * V2.2.2 - ファイル位置変更のためリンク修正 
 * V2.2.1 - 修正：非同期ステート更新待ち(waitFor)を追加。
 * V2.2.0 - 仕様変更対応：ニックネーム・氏名の表示、削除ボタンの隔離、
 * エキストラ画面リンクの検証を追加。V2.1.1の認可テストを継承。
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
}))

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('AdminDashboard - 会員管理パネル新仕様の検証 V2.2.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【認可】管理者権限がない場合、プロフィールへリダイレクトされること',
    async () => {
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

  it('【表示】番号・ニックネーム・氏名が表示され、削除ボタンがないこと',
    async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { roles: ROLES.SYSTEM_ADMIN },
        userRoles: ROLES.SYSTEM_ADMIN,
      } as any)

      const mockMembers = [
        {
          id: 'u1',
          member_number: 1,
          nickname: 'ニック一号',
          name: '氏名一号',
          status: 'active'
        }
      ]

      vi.mocked(memberApi.fetchMembers).mockResolvedValue({
        success: true,
        data: mockMembers as any,
        error: null
      })

      render(<AdminDashboard />)

      // 1. 会員番号 4桁フォーマットの確認
      expect(await screen.findByText('0001')).toBeTruthy()

      // 2. ニックネームと氏名の両方が表示されていることの確認
      expect(screen.getByText('ニック一号')).toBeTruthy()
      expect(screen.getByText('氏名一号')).toBeTruthy()

      // 3. 削除ボタンが一覧に存在しないことの確認
      expect(screen.queryByText('削除')).toBeNull()

      // 4. 詳細リンクが存在することの確認
      expect(screen.getByText('詳細')).toBeTruthy()
    })

  it('【操作】ステータスフィルタで表示対象が切り替わること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
      userRoles: ROLES.SYSTEM_ADMIN,
    } as any)

    const mockMembers = [
      { id: 'u1', name: '有効ユーザー', status: 'active', member_number: 1 },
      { id: 'u2', name: '申請ユーザー', status: 'new_req', member_number: 2 }
    ]

    vi.mocked(memberApi.fetchMembers).mockResolvedValue({
      success: true,
      data: mockMembers as any,
      error: null
    })

    render(<AdminDashboard />)

    expect(await screen.findByText('有効ユーザー')).toBeTruthy()
    expect(screen.getByText('申請ユーザー')).toBeTruthy()

    // 「申請中」フィルタを選択
    const select = screen.getByLabelText(/表示フィルタ/i)
    fireEvent.change(select, { target: { value: 'new_req' } })

    // 変更後のDOM状態をwaitForで待機（act警告対策）
    await waitFor(() => {
      expect(screen.queryByText('有効ユーザー')).toBeNull()
      expect(screen.getByText('申請ユーザー')).toBeTruthy()
    })
  })

it('【ナビ】エキストラ画面へのリンクが「管理権限を持つユーザー」に表示されること',
    async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        isLoading: false,
        user: { roles: 'president' },
        userRoles: 'president',
      } as any)

      vi.mocked(memberApi.fetchMembers).mockResolvedValue({
        success: true,
        data: [],
        error: null
      })

      render(<AdminDashboard />)

      // getByRole ではなく findByRole を使用して非同期の出現を待つ
      // これにより「読み込み中...」が消えた後のDOMを検証できる
      const extraLink = await screen.findByRole('link', { 
        name: /エキストラ/i 
      })

      expect(extraLink).toBeTruthy()
      expect(extraLink.getAttribute('href')).toBe('/members/admin/extra')
    })
})