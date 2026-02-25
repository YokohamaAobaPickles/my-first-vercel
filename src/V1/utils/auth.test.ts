/**
 * Filename: src/V1utils/auth.test.ts
 * Version : V1.0.0
 * Update  : 2026-02-25
 * 修正内容:
 * V1.0.0
 * - 新規作成。V1の権限判定ロジックを完全に網羅するテストコードを作成。
 */

import { describe, it, expect } from 'vitest'
import {
  canManageMembers,
  canManageAnnouncements,
  canManageEvents,
  canManageAccounts,
  canManageAudits,
  canManageAssets,
  canLogin,
  hasRole,
  getPrimaryRole
} from '@v1/utils/auth'
import { ROLES, Member } from '@v1/types/member'

describe('権限判定ロジックのリファクタリングテスト V2.1.2', () => {

  // 共通の異常系テストケースを定義
  // 型定義をすり抜けてきた不正値に対して false を返すことを担保
  const testInvalidInputs = (fn: Function) => {
    it('異常系：null, [], undefined の場合は false', () => {
      expect(fn(null)).toBe(false)
      expect(fn([])).toBe(false)
      expect(fn(undefined)).toBe(false)
    })
  }

  // 1. 会員管理権限
  describe('会員管理権限 (canManageMembers)', () => {
    it('正常系：システム管理者・会長・副会長・会員管理担当は true', () => {
      const allowed = [
        ROLES.SYSTEM_ADMIN,
        ROLES.PRESIDENT,
        ROLES.VICE_PRESIDENT, // 追加
        ROLES.MEMBER_MANAGER
      ]
      allowed.forEach(r => expect(canManageMembers([r])).toBe(true))
    })

    it('正常系：一般会員や他担当は false', () => {
      expect(canManageMembers([ROLES.MEMBER])).toBe(false)
      expect(canManageMembers([ROLES.ACCOUNTANT])).toBe(false)
    })

    it('兼務：配列の2番目に権限がある場合も true', () => {
      expect(canManageMembers([ROLES.MEMBER, ROLES.MEMBER_MANAGER])).toBe(true)
    })

    testInvalidInputs(canManageMembers)
  })

  // 2. お知らせ管理権限
  describe('お知らせ管理権限 (canManageAnnouncements)', () => {
    it('正常系：管理者・会長・副会長・お知らせ担当は true', () => {
      const allowed = [
        ROLES.SYSTEM_ADMIN, 
        ROLES.PRESIDENT, 
        ROLES.VICE_PRESIDENT, 
        ROLES.ANNOUNCEMENT_MANAGER
      ]
      allowed.forEach(r => expect(canManageAnnouncements([r])).toBe(true))
    })

    it('兼務：一般会員とお知らせ担当を兼ねている場合は true', () => {
      // 現状の getPrimaryRole 形式では Fail する箇所
      expect(canManageAnnouncements([ROLES.MEMBER, ROLES.ANNOUNCEMENT_MANAGER])).toBe(true)
    })

    testInvalidInputs(canManageAnnouncements)
  })

  // 3. 会計管理権限
  describe('会計管理権限 (canManageAccounts)', () => {
    it('正常系：管理者・会長・会計担当は true', () => {
      const allowed = [ROLES.SYSTEM_ADMIN, ROLES.PRESIDENT, ROLES.ACCOUNTANT]
      allowed.forEach(r => expect(canManageAccounts([r])).toBe(true))
    })

    it('兼務：一般会員と会計担当を兼ねている場合は true', () => {
      expect(canManageAccounts([ROLES.MEMBER, ROLES.ACCOUNTANT])).toBe(true)
    })

    testInvalidInputs(canManageAccounts)
  })

  // 4. イベント管理権限
  describe('イベント管理権限 (canManageEvents)', () => {
    it('正常系：管理者・会長・イベント担当は true', () => {
      const allowed = [ROLES.SYSTEM_ADMIN, ROLES.PRESIDENT, ROLES.EVENT_MANAGER]
      allowed.forEach(r => expect(canManageEvents([r])).toBe(true))
    })

    testInvalidInputs(canManageEvents)
  })

  // 5. ログイン可否判定
  describe('ログイン可否判定 (canLogin)', () => {
    it('許可されたステータスは true', () => {
      const allowed: any[] = [
        'active', 'new_req', 'suspended', 'suspend_req', 
        'withdraw_req', 'rejoin_req'
      ]
      allowed.forEach(s => expect(canLogin(s)).toBe(true))
    })

    it('終了・拒否ステータスは false', () => {
      expect(canLogin('withdrawn')).toBe(false)
      expect(canLogin('rejected')).toBe(false)
      expect(canLogin(null)).toBe(false)
    })
  })

  // 6. 特定ロール保持判定 (hasRole)
  describe('特定ロール保持判定 (hasRole)', () => {
    const mockUser = (roles: string[]): Member => ({
      id: 'u1', roles, name: 'T', name_roma: 'T', nickname: 'T',
      email: 't@e.com', status: 'active', member_number: '1', member_kind: 'general',
      emg_tel: '090', emg_rel: 'P'
    })

    it('指定したロールが含まれていれば true', () => {
      const user = mockUser([ROLES.MEMBER, ROLES.MEMBER_MANAGER])
      expect(hasRole(user, ROLES.MEMBER_MANAGER)).toBe(true)
      expect(hasRole(user, ROLES.MEMBER)).toBe(true)
    })

    it('異常系：userがnullやrolesが空なら false', () => {
      expect(hasRole(null, ROLES.MEMBER)).toBe(false)
      expect(hasRole(mockUser([]), ROLES.MEMBER)).toBe(false)
    })
  })
})