/**
 * Filename: src/V1/app/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-02-25
 * 修正内容：
 * V1.0.0
 * - 新規作成。app/page.tsx のルートページのリダイレクトロジックを完全に網羅するテストコードを作成。
 */

import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import RootPage from '@v1/app/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

// Mock definitions
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'), // ★ これが必要
}))

vi.mock('@/hooks/useAuthCheck')

vi.mock('@v1/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}))

describe('RootPage (app/page.tsx) - 交通整理のテスト', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ replace: mockReplace })
  })

  describe('LINEアプリからのアクセス (currentLineIdがある場合)', () => {
    // Case 1: LINE初回アクセス (IDあり / DB未登録)
    test('【Case 1】DB未登録なら /login へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: 'LINE_ID_EXAMPLE',
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/app/login'))
    })

    // Case 2: LINEリピート (IDあり / DB登録済み)
    test('【Case 2】DB登録済みなら /members/profile へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: { id: 'existing-uuid' },
        isLoading: false,
        currentLineId: 'LINE_ID_EXAMPLE',
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/profile'))
    })
  })

  describe('ブラウザからのアクセス (currentLineIdがない場合)', () => {
    // Case 3: ブラウザ未ログイン (IDなし / セッションなし)
    test('【Case 3】未ログインなら /login へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: null,
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/app/login'))
    })

    // Case 4: ブラウザログイン済み (IDなし / セッションあり)
    test('【Case 4】ログイン済みなら /members/profile へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: { id: 'existing-uuid' },
        isLoading: false,
        currentLineId: null,
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/app/member/profile'))
    })
  })
})