/**
 * Filename: src/lib/memberApi.test.ts
 * Version : V3.1.0
 * Update  : 2026-01-29
 * Remarks : 
 * V3.1.0 - 修正：新ステータス名称 (new_req) に合わせて期待値を修正
 * V3.1.0 - 修正：withdraw 関連の名称変更に伴うテストデータの見直し
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
  registerMember
} from './memberApi'
import { supabase } from '@/lib/supabase'
import { Member, MemberInput } from '@/types/member'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('memberApi - 会員DB操作・連携の総合検証 V3.1.0', () => {
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
        status: 'new_req' // 修正
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
      if (result.success && result.data) {
        expect(result.data.id).toBe('generated-uuid-123')
        expect(result.data.status).toBe('new_req')
      }
    })
  })

  describe('fetchPendingMembers (承認待ち取得)', () => {
    it('【正常系】承認待ちユーザー(new_req)を正しい条件で取得すること',
      async () => {
        const mockData = [{
          id: '1',
          name: 'テスト太郎',
          status: 'new_req' // 修正
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
        // eq('status', 'new_req') が呼ばれているはず
        expect(mockFrom().eq).toHaveBeenCalledWith('status', 'new_req')
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

})