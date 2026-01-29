/**
 * Filename: src/lib/memberApi.test.ts
 * Version : V3.2.1
 * Update  : 2026-01-30
 * Remarks : 
 * V3.2.1 - 修正：deleteMember のテストケース追加とモック定義の改善。
 * V3.1.0 - 修正：新ステータス名称 (new_req) に合わせて期待値を修正。
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import {
  fetchPendingMembers,
  updateMemberStatus,
  fetchMemberById,
  fetchMembers,
  fetchMemberByEmail,
  linkLineIdToMember,
  registerMember,
  deleteMember // 追加
} from './memberApi'
import { supabase } from '@/lib/supabase'
import { Member, MemberInput } from '@/types/member'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('memberApi - 会員DB操作・連携の総合検証 V3.2.1', () => {
  const mockFrom = supabase.from as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerMember (新規会員登録)', () => {
    it('【正常系】データを挿入し、作成されたレコードを返すこと', async () => {
      const mockInput: MemberInput = {
        name: '新規 太郎',
        email: 'new@example.com',
        status: 'new_req'
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
      expect(result.data?.id).toBe('generated-uuid-123')
    })
  })

  describe('deleteMember (会員レコード削除)', () => {
    it('【正常系】指定したIDのレコードが物理削除されること', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      
      mockFrom.mockReturnValue({
        delete: mockDelete
      })

      const result = await deleteMember('u123')
      
      expect(result.success).toBe(true)
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'u123')
    })

    it('【異常系】DBエラー時に適切なエラーレスポンスを返すこと', async () => {
      const mockError = { message: 'Delete failed', code: 'D001' }
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })

      mockFrom.mockReturnValue({
        delete: mockDelete
      })

      const result = await deleteMember('u123')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Delete failed')
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
      expect(mockFrom().update).toHaveBeenCalledWith({ status: 'active' })
    })
  })

  describe('fetchPendingMembers (承認待ち取得)', () => {
    it('【正常系】承認待ちユーザー(new_req)を正しい条件で取得すること',
      async () => {
        const mockData = [{ id: '1', status: 'new_req' }]
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
        expect(mockFrom().eq).toHaveBeenCalledWith('status', 'new_req')
      })
  })

  describe('fetchMembers (全会員一覧取得)', () => {
    it('【正常系】全会員を会員番号順に取得できること', async () => {
      const mockData = [{ member_number: 1 }]
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
      const mockMember = { email: 'exist@example.com' }
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
      const mockMember = { id: 'u123' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMember, error: null })
      })
      const result = await fetchMemberById('u123')
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('u123')
    })
  })
})