/**
 * Filename: src/lib/memberApi.test.ts
 * Version : V3.0.1
 * Update  : 2026-01-28
 * Remarks : 
 * V3.0.1 - registerMember のテストケースを追加
 * V3.0.1 - MemberInput のインポートと mockFrom のスコープ修正
 * V3.0.1 - カッコの閉じ忘れ等による構文エラーの解消
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  fetchPendingMembers, 
  updateMemberStatus, 
  fetchMemberById,
  fetchMembers,
  fetchMemberByEmail,
  linkLineIdToMember,
  registerMember
} from './memberApi'
import { supabase } from '@/lib/supabase'
import { Member, MemberInput } from '@/types/member' 

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('memberApi - 会員DB操作・連携の総合検証 V3.0.1', () => {
  // すべての test case で使うため describe のトップレベルで定義
  const mockFrom = supabase.from as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

describe('registerMember (新規会員登録)', () => {
    it('【正常系】データを挿入し、作成されたレコードを返すこと', async () => {
      const mockInput: MemberInput = {
        name: '新規 太郎',
        email: 'new@example.com',
        password: 'password123',
        status: 'registration_request'
      } as MemberInput

      const mockCreatedMember = { id: 'generated-uuid-123', ...mockInput }
      
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: mockCreatedMember, 
        error: null 
      })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      mockFrom.mockReturnValue({ insert: mockInsert })

      const result = await registerMember(mockInput)

      expect(result.success).toBe(true)
      // any を外して、本体コードの ApiResponse<Member> が効いているか確認
      // もしここで型エラーが出るなら、memberApi.ts の保存が反映されていません
      if (result.success && result.data) {
        expect(result.data.id).toBe('generated-uuid-123')
      }
      expect(mockFrom).toHaveBeenCalledWith('members')
    })
  })
  
  describe('fetchPendingMembers (承認待ち取得)', () => {
    it('【正常系】承認待ちユーザーを正しい条件で取得すること', async () => {
      const mockData = [{ 
        id: '1', 
        name: 'テスト太郎', 
        status: 'registration_request' 
      }]
      const mockOrder = vi.fn().mockResolvedValue({ 
        data: mockData, 
        error: null 
      })
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

  describe('fetchMembers (全会員一覧取得)', () => {
    it('【正常系】全会員を会員番号順に取得できること', async () => {
      const mockData = [
        { member_number: 1, name: 'A' }, 
        { member_number: 2, name: 'B' }
      ]
      const mockOrder = vi.fn().mockResolvedValue({ 
        data: mockData, 
        error: null 
      })
      mockFrom.mockReturnValue({ 
        select: vi.fn().mockReturnThis(), 
        order: mockOrder 
      })

      const result = await fetchMembers()
      expect(result.success).toBe(true)
      expect(mockOrder).toHaveBeenCalledWith(
        'member_number', 
        { ascending: true }
      )
    })
  })

  describe('fetchMemberByEmail (メールによる検索)', () => {
    it('【正常系】存在するメールアドレスで1件取得できること', async () => {
      const mockMember = { email: 'exist@example.com', name: '存在' }
      const mockMaybeSingle = vi.fn().mockResolvedValue({ 
        data: mockMember, 
        error: null 
      })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle
      })

      const result = await fetchMemberByEmail('exist@example.com')
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('exist@example.com')
    })
  })

  describe('linkLineIdToMember (LINE ID 紐付け)', () => {
    it('【正常系】メールをキーに LINE ID を更新できること', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({ 
        update: vi.fn().mockReturnThis(), 
        eq: mockEq 
      })

      const result = await linkLineIdToMember('test@example.com', 'L_NEW_ID')
      expect(result.success).toBe(true)
    })
  })

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
    it('【正常系】指定ステータスへの更新リクエストが飛ぶこと', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({ 
        update: vi.fn().mockReturnThis(), 
        eq: mockEq 
      })

      const result = await updateMemberStatus('u123', 'active')
      expect(result.success).toBe(true)
    })
  })
})