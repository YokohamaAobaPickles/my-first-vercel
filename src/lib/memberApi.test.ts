/**
 * Filename: src/lib/memberApi.test.ts
 * Version : V3.7.0
 * Update  : 2026-02-01
 * Remarks : 
 * V3.7.0 - 追加：updateMemberPassword のテスト（正常系・異常系）。
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
  fetchMemberByDuprId,
  fetchMembers,
  fetchMemberByEmail,
  linkLineIdToMember,
  registerMember,
  deleteMember,
  checkMemberReferenced,
  updateMemberPassword,
  saveResetToken,
  fetchMemberByResetToken,
  updatePasswordByResetToken,
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

    it('【安全ガード】roles が string の場合でも配列に変換されて保存されること', async () => {
      const mockInput: MemberInput = {
        name: '新規 太郎',
        email: 'new@example.com',
        status: 'new_req',
        roles: 'member'   // ← string で渡す
      } as any

      const mockCreatedMember = { id: 'uuid-1', ...mockInput, roles: ['member'] }

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockCreatedMember,
        error: null
      })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

      mockFrom.mockReturnValue({ insert: mockInsert })

      const result = await registerMember(mockInput)

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          roles: ['member']   // ← 配列化されていることを検証
        })
      ])
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

  describe('fetchMemberByDuprId (DUPR ID で会員取得)', () => {
    it('【正常系】0件のとき data: null を返すこと', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
      const result = await fetchMemberByDuprId('ABC123')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('【正常系】1件のときその会員を返すこと', async () => {
      const mockMember = { id: 'u1', dupr_id: 'WKRV2Q' }
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [mockMember],
          error: null
        })
      })
      const result = await fetchMemberByDuprId('WKRV2Q')
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('u1')
      expect(result.data?.dupr_id).toBe('WKRV2Q')
    })

    it('【異常系】同一 DUPR ID が複数会員に登録されているとき更新せずエラーを返すこと', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            { id: 'u1', dupr_id: 'WKRV2Q' },
            { id: 'u2', dupr_id: 'WKRV2Q' }
          ],
          error: null
        })
      })
      const result = await fetchMemberByDuprId('WKRV2Q')
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('DUPLICATE_DUPR_ID')
      expect(result.error?.message).toContain('同一のDUPR IDが複数会員に登録されています')
    })
  })

  describe('updateMemberPassword (パスワード変更)', () => {
    it('【正常系】現在のパスワードが一致するとき新パスワードで更新されること', async () => {
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
      const mockSelectChain: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { password: 'oldpass' },
          error: null,
        }),
      }
      let callCount = 0
      mockFrom.mockImplementation(() => {
        callCount++
        return callCount === 1
          ? mockSelectChain
          : { update: mockUpdate }
      })

      const result = await updateMemberPassword('u123', 'oldpass', 'newpass')

      expect(result.success).toBe(true)
      expect(mockUpdate).toHaveBeenCalledWith({ password: 'newpass' })
    })

    it('【異常系】現在のパスワードが一致しないときエラーを返すこと', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { password: 'realpass' },
          error: null,
        }),
      })

      const result = await updateMemberPassword('u123', 'wrongpass', 'newpass')

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('現在のパスワードが正しくありません')
      expect(result.error?.code).toBe('WRONG_PASSWORD')
    })
  })

  describe('saveResetToken (パスワードリセットトークン保存)', () => {
    it('【正常系】reset_token と reset_token_expires_at を更新できること', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq }),
      })

      const expiresAt = new Date('2026-02-01T12:00:00Z')
      const result = await saveResetToken('u123', 'abc-token', expiresAt)

      expect(result.success).toBe(true)
      expect(mockFrom().update).toHaveBeenCalledWith({
        reset_token: 'abc-token',
        reset_token_expires_at: '2026-02-01T12:00:00.000Z',
      })
    })
  })

  describe('fetchMemberByResetToken (トークンで会員取得)', () => {
    it('【正常系】トークンに一致する会員を返すこと', async () => {
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: 'u1', reset_token: 'valid-token' },
          error: null,
        }),
      })

      const result = await fetchMemberByResetToken('valid-token')

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('u1')
    })

    it('【正常系】トークンが空のとき data: null を返すこと', async () => {
      const result = await fetchMemberByResetToken('')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })
  })

  describe('updatePasswordByResetToken (トークンでパスワード更新)', () => {
    it('【正常系】パスワードを更新しトークンをクリアできること', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: mockEq }),
      })

      const result = await updatePasswordByResetToken('u123', 'newpass')

      expect(result.success).toBe(true)
      expect(mockFrom().update).toHaveBeenCalledWith({
        password: 'newpass',
        reset_token: null,
        reset_token_expires_at: null,
      })
    })
  })

  describe('checkMemberReferenced (物理削除前の参照チェック)', () => {
    it('【正常系】announcements に author_id が存在しないとき referenced: false を返すこと', async () => {
      const chain: any = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.limit = vi.fn().mockResolvedValue({ data: [], error: null })
      mockFrom.mockReturnValue(chain)
      const result = await checkMemberReferenced('member-uuid-1')
      expect(result.success).toBe(true)
      expect(result.data?.referenced).toBe(false)
    })

    it('【異常系】announcements に author_id が存在するとき referenced: true とメッセージを返すこと', async () => {
      const chain: any = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.limit = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      })
      mockFrom.mockReturnValue(chain)
      const result = await checkMemberReferenced('member-uuid-1')
      expect(result.success).toBe(true)
      expect(result.data?.referenced).toBe(true)
      expect(result.data?.message).toContain(
        'お知らせの作成者として参照されています'
      )
    })
  })
})