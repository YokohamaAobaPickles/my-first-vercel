/**
 * Filename: src/lib/memberAPI.test.ts
 * Version : V1.1.2
 * Update  : 2026-01-26
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPendingMembers, updateMemberStatus } from './memberApi'
import { supabase } from './supabase'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('memberApi - 会員DB操作の検証 V1.1.2', () => {
  const mockFrom = supabase.from as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【取得】承認待ちユーザーを正しい条件と順序で取得すること', async () => {
    // チェーンメソッドをすべて mockReturnThis() で繋ぎ、最後だけ mockResolvedValue を返す
    const mockSelect = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockResolvedValue({ 
      data: [{ id: '1', name: 'テスト太郎' }], 
      error: null 
    })
    
    mockFrom.mockReturnValue({ 
      select: mockSelect, 
      eq: mockEq, 
      order: mockOrder 
    })

    const members = await fetchPendingMembers()

    expect(mockFrom).toHaveBeenCalledWith('members')
    expect(mockEq).toHaveBeenCalledWith('status', 'registration_request')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(members[0].name).toBe('テスト太郎')
  })

  it('【更新】指定したIDのステータスを更新できること', async () => {
    const mockUpdate = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ update: mockUpdate, eq: mockEq })

    const result = await updateMemberStatus('user-123', 'active')

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'active' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    expect(result.success).toBe(true)
  })

  it('【異常系】DBエラーが発生した際に success: false を返すこと', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'DB Error' } })
    })

    const result = await updateMemberStatus('user-123', 'active')
    expect(result.success).toBe(false)
  })
})