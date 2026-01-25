/**
 * Filename: hooks/useAuthCheck.test.ts
 * Version : V1.1.2
 * Update  : 2026-01-25
 * 内容:
 * V1.1.2
 * - PCブラウザからの新規登録画面アクセス許可を「isLoading完了後」に検証するよう厳格化
 * - 本体修正前に確実に FAIL することを確認するための同期制御を追加
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

describe('useAuthCheck (認証・遷移・例外パスの統合検証)', () => {
  const mockReplace = vi.fn()
  const TEST_LINE_ID = 'U_NEW_USER_123'

  beforeEach(() => {
    vi.clearAllMocks()
    // useRouterのmockにreplaceを登録
    ;(useRouter as any).mockReturnValue({ replace: mockReplace })
    
    // デフォルト設定：LIFFログイン済み、LINE内ブラウザ
    ;(liff.isLoggedIn as any).mockReturnValue(true)
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Line/12.1.1',
      configurable: true
    })
  })

  it('【厳格検証】PCブラウザから /members/new にアクセスした際、強制遷移が発生しないこと', async () => {
    // 1. パスを新規登録画面に設定
    ;(usePathname as any).mockReturnValue('/members/new')
    
    // 2. UserAgentをPCに設定（LINE文字列を含まない）
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
      configurable: true
    })

    // 3. LIFF未ログイン、Supabase未認証の状態を再現
    ;(liff.isLoggedIn as any).mockReturnValue(false)
    ;(supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: null } 
    })

    const { result } = renderHook(() => useAuthCheck())

    // 4. まず isLoading が false になる（全処理が終わる）のを待つ
    // 本体 V1.8.5 では、ここで全処理が終わった後に replace('/members/login') が呼ばれる
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    // 5. 結果：replace が一度も呼ばれていないことを期待
    // 本体のホワイトリストが未実装なら、ここで失敗するはず
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('LINE初回ユーザー：DB未登録の時、currentLineIdを保持してログイン画面へ遷移すること', async () => {
    ;(usePathname as any).mockReturnValue('/members/profile')
    ;(liff.init as any).mockResolvedValue(undefined)
    ;(liff.getProfile as any).mockResolvedValue({ userId: TEST_LINE_ID })
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ 
      data: null, 
      error: null 
    })
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: mockMaybeSingle
    })

    const { result } = renderHook(() => useAuthCheck())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 2000 })

    expect(result.current.currentLineId).toBe(TEST_LINE_ID)
    expect(mockReplace).toHaveBeenCalledWith('/members/login')
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
    expect(mockReplace).not.toHaveBeenCalled()
  })
})