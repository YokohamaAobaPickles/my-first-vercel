/**
 * Filename: hooks/useAuthCheck.test.ts
 * Version : V1.0.3
 * Update  : 2026-01-25
 * 内容:
 * V1.0.3
 * - 初回ユーザー時に currentLineId が null のままリダイレクトされる不具合を再現する
 * V1.0.2
 * - ロジック不備を確実に検知するため、currentLineIdの検証を強化
 * V1.0.1
 * - モックに isLoggedIn を追加
 * - モックに @line/liff を追加
 * V1.0.0
 * - LINE初回ユーザー（DB未登録）のハンドリングおよび環境分離の検証
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

// Mockの設定
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn(),
    getProfile: vi.fn(),
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    auth: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn(),
    getProfile: vi.fn(),
    isLoggedIn: vi.fn(() => true), // 追加：常にログイン済みとして振る舞う
  },
}))

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn(),
    getProfile: vi.fn(),
    isLoggedIn: vi.fn(() => true), // 追加：関数のモック
    login: vi.fn(),
  },
}))

describe('useAuthCheck (V1.0.0)', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
      ; (useRouter as any).mockReturnValue({ replace: mockReplace })
      ; (usePathname as any).mockReturnValue('/')

    // UserAgentをLINEアプリ内に設定
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1 Line/11.14.3',
      configurable: true
    })
  })

  it('A-01: LINE初回ユーザーの場合、エラー画面にならずに /members/login へ遷移すること', async () => {
    // LIFFはプロフィールを返すが、DB(Supabase)は空（member: null）を返す設定
    ; (liff.init as any).mockResolvedValue(undefined)
      ; (liff.getProfile as any).mockResolvedValue({ userId: 'U_NEW_USER_123' })

    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      ; (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle
      })

    const { result } = renderHook(() => useAuthCheck())

    // 内部の非同期処理が終わるのを待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // /members/login への遷移が呼ばれていることを確認
    expect(mockReplace).toHaveBeenCalledWith('/members/login')

    // currentLineId が正しくセットされていることを確認
    expect(result.current.currentLineId).toBe('U_NEW_USER_123')
  })

  it('PCブラウザの場合、LIFFを初期化せずにSupabaseセッションを確認すること', async () => {
    // UserAgentをChrome(PC)に設定
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      configurable: true
    })

      ; (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // PC環境では liff.init が呼ばれていないことを確認
    expect(liff.init).not.toHaveBeenCalled()
    // 未ログインなので /members/login へのリダイレクトが行われる
    expect(mockReplace).toHaveBeenCalledWith('/members/login')
  })

  it('A-01: LINE初回ユーザーの場合、currentLineIdをセットして /members/login へ遷移すること', async () => {
    const TEST_LINE_ID = 'U_NEW_USER_123';
    
    ;(liff.init as any).mockResolvedValue(undefined)
    ;(liff.getProfile as any).mockResolvedValue({ userId: TEST_LINE_ID })
    
    // DBにはデータがない（初回ユーザー）
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle
    })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    // ここが現在の実装だと null になっているはず
    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
    expect(mockReplace).toHaveBeenCalledWith('/members/login')
  })

  it('A-01: LINE初回ユーザーの場合、currentLineIdが正しく保持されていること', async () => {
    const TEST_LINE_ID = 'U_NEW_USER_123';
    
    // LIFFの設定
    ;(liff.init as any).mockResolvedValue(undefined)
    ;(liff.getProfile as any).mockResolvedValue({ userId: TEST_LINE_ID })
    
    // DBにユーザーが存在しない（nullを返す）
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle
    })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      // ローディングが終わるまで待機
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    // 【重要】現在のコードに不備があるなら、ここで currentLineId は null のはず。
    // そのため、この期待値設定でテストが「失敗」することを確認したい。
    expect(result.current.currentLineId).not.toBeNull()
    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
  })
  
})