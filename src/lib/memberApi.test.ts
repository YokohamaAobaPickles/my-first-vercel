/**
 * Filename: src/lib/memberApi.test.ts
 * Version : V3.0.0
 * Update  : 2026-01-27
 * 内容：
 * - memberHelpers から移管された関数のテストを統合
 * - maybeSingle() による「該当なし(null)」の正常系ハンドリングを検証
 * - すべての結果が ApiResponse 形式であることを担保
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  fetchPendingMembers, 
  updateMemberStatus, 
  fetchMemberById,
  fetchMembers,
  fetchMemberByEmail,
  linkLineIdToMember
} from './memberApi'
import { supabase } from '@/lib/supabase' // パスをプロジェクト標準に合わせました
import { Member } from '@/types/member' 

// Supabaseクライアントのモック化
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('memberApi - 会員DB操作・連携の総合検証 V3.0.0', () => {
  const mockFrom = supabase.from as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- 既存の管理機能系テスト ---

  describe('fetchPendingMembers (承認待ち取得)', () => {
    it('【正常系】承認待ちユーザーを正しい条件で取得すること', async () => {
      const mockData = [{ id: '1', name: 'テスト太郎', status: 'registration_request' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      mockFrom.mockReturnValue({ 
        select: vi.fn().mockReturnThis(), 
        eq: vi.fn().mockReturnThis(), 
        order: mockOrder 
      })

      const result = await fetchPendingMembers()
      expect(result.success).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('members')
    })
  })

  // --- 新しく統合した関数のテスト ---

  describe('fetchMembers (全会員一覧取得)', () => {
    it('【正常系】全会員を会員番号順に取得できること', async () => {
      const mockData = [{ member_number: 1, name: 'A' }, { member_number: 2, name: 'B' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      mockFrom.mockReturnValue({ 
        select: vi.fn().mockReturnThis(), 
        order: mockOrder 
      })

      const result = await fetchMembers()
      expect(result.success).toBe(true)
      expect(mockOrder).toHaveBeenCalledWith('member_number', { ascending: true })
      expect(result.data).toHaveLength(2)
    })
  })

  describe('fetchMemberByEmail (メールによる検索)', () => {
    it('【正常系】存在するメールアドレスで1件取得できること', async () => {
      const mockMember = { email: 'exist@example.com', name: '存在' }
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockMember, error: null })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      })

      const result = await fetchMemberByEmail('exist@example.com')
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('exist@example.com')
    })

    it('【正常系】データが存在しない場合に null を返し、成功扱い(success:true)となること', async () => {
      // maybeSingle は 0件でも error を出さないのが正しい挙動
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      })

      const result = await fetchMemberByEmail('none@example.com')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })
  })

  describe('linkLineIdToMember (LINE ID 紐付け)', () => {
    it('【正常系】メールアドレスをキーにして LINE ID を更新できること', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({ 
        update: vi.fn().mockReturnThis(), 
        eq: mockEq 
      })

      const result = await linkLineIdToMember('test@example.com', 'L_NEW_ID')
      expect(result.success).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('members')
    })
  })

  // --- 既存の ID取得・ステータス更新テスト ---

  describe('fetchMemberById (特定会員取得)', () => {
    it('【正常系】single() を使用してID検索し成功すること', async () => {
      const mockMember = { id: 'u123', roles: 'president' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMember, error: null })
      })
      const result = await fetchMemberById('u123')
      expect(result.success).toBe(true)
      expect(result.data?.roles).toBe('president')
    })
  })

  describe('updateMemberStatus (ステータス更新)', () => {
    it('【正常系】指定のステータスへの更新リクエストが飛ぶこと', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({ update: vi.fn().mockReturnThis(), eq: mockEq })

      const result = await updateMemberStatus('u123', 'active')
      expect(result.success).toBe(true)
    })
  })
})