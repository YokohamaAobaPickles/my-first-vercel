/**
 * Filename: src/app/members/admin/page.test.tsx
 * Version : V1.3.1
 * Update  : 2026-01-28
 * 修正内容：
 * - fetchPendingMembers のモック戻り値を ApiResponse 型に修正
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminDashboard from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { ROLES } from '@/types/member'
// APIのモック化用
import * as memberApi from '@/lib/memberApi'

vi.mock('@/hooks/useAuthCheck')
// memberApi をまるごとモック化
vi.mock('@/lib/memberApi', () => ({
  fetchPendingMembers: vi.fn(),
}))

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('AdminDashboard - 実データ連携の検証 V1.3.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【表示】データ取得後、承認待ち会員がリスト表示されること', async () => {
    // 1. 権限を管理者にする
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
    })

    // 2. APIが返すデータを ApiResponse 形式でモック
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'user-1',
          name: 'リアルな申請者A',
          roles: '一般',
          status: 'registration_request'
        }
      ],
      error: null
    }
    ;(memberApi.fetchPendingMembers as any).mockResolvedValue(mockResponse)

    render(<AdminDashboard />)

    // 非同期で描画されるのを待つ
    expect(await screen.findByText('リアルな申請者A')).toBeTruthy()
  })

  it('【表示】承認待ちが0人の場合、専用のメッセージが出ること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
    })

    // APIが空の成功レスポンスを返す場合
    ;(memberApi.fetchPendingMembers as any).mockResolvedValue({
      success: true,
      data: [],
      error: null
    })

    render(<AdminDashboard />)

    expect(await screen.findByText(/承認待ちの会員はいません/)).toBeTruthy()
  })

  it('【ガード】権限がない場合はリダイレクトされること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: '一般' },
    })

    render(<AdminDashboard />)
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})