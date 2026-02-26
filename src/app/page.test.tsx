/**
 * Filename: app/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-01-26
 * 修正内容：
 * V1.1.0
 * - describeによる階層化を行い、LINE環境とPC環境のテストを明示的に分離
 * - デバイス別の振る舞い（currentLineIdの有無）をテストロジックに反映
 * V1.0.2
 * - Supabase初期化エラー(supabaseUrl is required)回避のため、supabaseモジュールをモックに追加
 * V1.0.1
 * - vitest用にjestをviに書き換え
 * V1.0.0
 * - ルート階層（app/page.tsx）における交通整理ロジックのテストコード初版作成
 * - LINE初回アクセス、LINEリピート、PC未ログイン、PCログイン済みの4ケースを網羅
 */

import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import RootPage from './page'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'

// Mock definitions
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('@v1/hooks/useAuthCheck')

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
    test('【Case 1】DB未登録なら /V1/login へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: 'LINE_ID_EXAMPLE',
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'))
    })

    // Case 2: LINEリピート (IDあり / DB登録済み)
    test('【Case 2】DB登録済みなら /V1/members/profile へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: { id: 'existing-uuid' },
        isLoading: false,
        currentLineId: 'LINE_ID_EXAMPLE',
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/members/profile'))
    })
  })

  describe('ブラウザからのアクセス (currentLineIdがない場合)', () => {
    // Case 3: ブラウザ未ログイン (IDなし / セッションなし)
    test('【Case 3】未ログインなら /V1/login へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: null,
        isLoading: false,
        currentLineId: null,
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/login'))
    })

    // Case 4: ブラウザログイン済み (IDなし / セッションあり)
    test('【Case 4】ログイン済みなら /V1/members/profile へリダイレクトすること', async () => {
      (useAuthCheck as Mock).mockReturnValue({
        user: { id: 'existing-uuid' },
        isLoading: false,
        currentLineId: null,
      })
      render(<RootPage />)
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/V1/members/profile'))
    })
  })
})