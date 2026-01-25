/**
 * Filename: hooks/useAuthCheck.test.ts
 * Version : V1.1.3
 * Update  : 2026-01-25
 * 内容:
 * V1.1.3
 * - LINEユーザーの「表示名（ニックネーム）」を返り値に含める検証を追加
 * - LIFFのgetProfileモックに displayName を追加
 * V1.1.2
 * - PCブラウザからの新規登録画面アクセス許可を「isLoading完了後」に検証
 * V1.1.1
 * - mockReplace の呼び出し検証を厳密化
 * V1.0.6
 * - supabaseモックに maybeSingle を追加し TypeError を解消
 * V1.0.5-V1.0.0
 * - 履歴継承：LIFF ID保持、PGRST116相当(null)のハンドリング、環境分離の検証
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
      maybeSingle: vi.fn(),
    })),
    auth: {
      getSession: vi.fn(),
    },
  },
}))

describe('useAuthCheck (LINE情報取得の拡張検証)', () => {
  const mockReplace = vi.fn()
  const TEST_LINE_ID = 'U_NEW_USER_123'
  const TEST_DISPLAY_NAME = 'テスト名'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ replace: mockReplace })
    
    ;(liff.isLoggedIn as any).mockReturnValue(true)
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Line/12.1.1',
      configurable: true
    })
  })

  it('【新規検証】LINE未登録ユーザー時、IDだけでなくニックネーム（displayName）も返却すること', async () => {
    ;(usePathname as any).mockReturnValue('/members/login')
    ;(liff.init as any).mockResolvedValue(undefined)
    
    // LIFFプロフィールに displayName を含めてモック化
    ;(liff.getProfile as any).mockResolvedValue({ 
      userId: TEST_LINE_ID,
      displayName: TEST_DISPLAY_NAME 
    })
    
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    })

    const { result } = renderHook(() => useAuthCheck())

    // 処理完了を待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // LINE IDの保持を確認
    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
    
    // 【ここでFAILを期待】ニックネームが新しく取得できていることを検証
    expect((result.current as any).lineNickname).toBe(TEST_DISPLAY_NAME)
  })

  it('【厳格検証】PCブラウザから /members/new にアクセスした際、強制遷移が発生しないこと', async () => {
    ;(usePathname as any).mockReturnValue('/members/new')
    
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
      configurable: true
    })

    ;(liff.isLoggedIn as any).mockReturnValue(false)
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // EXEMPT_PATHSにより replace が呼ばれないことを期待
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('LINE登録済みユーザー：正常にプロフィール情報を取得できること', async () => {
    ;(usePathname as any).mockReturnValue('/members/profile')
    const MOCK_USER = { 
      line_id: TEST_LINE_ID, 
      roles: 'general', 
      name: 'テストユーザー' 
    }
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
  })
})