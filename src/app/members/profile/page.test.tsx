/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V1.4.4
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { ROLES } from '@/utils/auth'

vi.mock('@/hooks/useAuthCheck')

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('ProfilePage - 管理者権限の検証 V1.4.4', () => {
  const TEST_LINE_ID = 'U_TEST_USER_456'
  const TEST_USER = {
    name: 'テスト太郎',
    nickname: 'タロウ',
    member_number: 'M-001',
    member_kind: '正会員',
    roles: '一般',
    status: 'active',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【権限】システム管理者の場合、管理パネルへのリンクが表示されること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { ...TEST_USER, roles: ROLES.SYSTEM_ADMIN },
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/会員管理パネル/)).toBeTruthy()
  })

  it('【権限】会員管理担当の場合、管理パネルへのリンクが表示されること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { ...TEST_USER, roles: ROLES.MEMBER_MANAGER },
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/会員管理パネル/)).toBeTruthy()
  })

  it('【権限】一般ユーザーの場合、管理パネルへのリンクが表示されないこと', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { ...TEST_USER, roles: '一般' },
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.queryByText(/会員管理パネル/)).toBeNull()
  })

  it('【正常系】登録済みユーザーの情報が正しく表示されること', async () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/テスト太郎/)).toBeTruthy()
  })
})