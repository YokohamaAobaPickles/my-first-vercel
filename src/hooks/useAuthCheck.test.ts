/**
 * Filename: hooks/useAuthCheck.test.ts
 * Version : V1.0.6
 * Update  : 2026-01-25
 * 内容:
 * V1.0.6
 * - supabaseモックに maybeSingle を追加し TypeError を解消
 * V1.0.5
 * - liff.isLoggedIn のモックを追加し TypeError を解消
 * - LINE初回ユーザー（DB未登録）時、PGRST116エラーでも確実に currentLineId を保持することを検証
 * V1.0.4
 * - LINE初回ユーザー（DB未登録）時、supabaseのエラー(PGRST116)が発生しても
 * 正しく currentLineId を保持し /members/login へリダイレクトされることを検証
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
    isLoggedIn: vi.fn(),
    login: vi.fn(),
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(), // 呼び出し可能にする
    })),
    auth: {
      getSession: vi.fn(),
    },
  },
}))

describe('useAuthCheck (A-01: 認証・遷移ロジック検証)', () => {
  const mockReplace = vi.fn()
  const TEST_LINE_ID = 'U_NEW_USER_123'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ replace: mockReplace })
    ;(usePathname as any).mockReturnValue('/members/profile')
    
    // NavigatorのUserAgentをLineに偽装
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Line/12.1.1',
      configurable: true
    })

    // デフォルトのLIFFモック動作
    ;(liff.isLoggedIn as any).mockReturnValue(true)
  })

  it('【不具合再現】LINE初回ユーザー：DB未登録(PGRST116)の時、currentLineIdを保持してログイン画面へ遷移すること', async () => {
    // LIFFの設定
    ;(liff.init as any).mockResolvedValue(undefined)
    ;(liff.getProfile as any).mockResolvedValue({ userId: TEST_LINE_ID })
    
    // Supabaseが「0件（null）」を返す状態を再現
    // 本体が maybeSingle を使うようになったので、mockMaybeSingle を定義
    const mockMaybeSingle = vi.fn().mockResolvedValue({ 
      data: null, 
      error: null // maybeSingle は 0 件なら error: null を返す
    })
    
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle
    })

    const { result } = renderHook(() => useAuthCheck())

    // 非同期処理の完了を待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    // 検証：currentLineId が null ではなく TEST_LINE_ID であること
    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
    expect(mockReplace).toHaveBeenCalledWith('/members/login')
  })

  it('LINE登録済みユーザー：正常にプロフィール情報を取得できること', async () => {
    const MOCK_USER = { line_id: TEST_LINE_ID, roles: 'general', name: 'テストユーザー' }
    ;(liff.init as any).mockResolvedValue(undefined)
    ;(liff.getProfile as any).mockResolvedValue({ userId: TEST_LINE_ID })
    
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: MOCK_USER, error: null })
    })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(MOCK_USER)
    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
    expect(mockReplace).not.toHaveBeenCalled()
  })
})