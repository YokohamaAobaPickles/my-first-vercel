/**
 * Filename: src/utils/auth.test.ts
 * Version : V2.0.1 (string[] 対応)
 * Update  : 2026-02-02
 * 修正内容:
 * - roles を string → string[] に統一
 * - canManageMembers / hasRole の引数を string[] に統一
 * - 兼務テストも string[] 形式に修正
 */

import { describe, it, expect } from 'vitest'
import {
  canManageRoles,
  canManageMembers,
  canManageAnnouncements,
  canManageEvents,
  canManageAccounts,
  canManageAudits,
  canManageAssets,
  canLogin,
  hasRole
} from './auth'
import { ROLES, Member } from '@/types/member'

describe('権限判定ロジックの詳細テスト V2.0.1', () => {

  describe('システム管理者 (SYSTEM_ADMIN) の全能性テスト', () => {
    const adminRoles = [ROLES.SYSTEM_ADMIN]

    it('システム管理者は、全ての管理機能に対して true を返すこと', () => {
      expect(canManageMembers(adminRoles)).toBe(true)
      expect(canManageAnnouncements(adminRoles)).toBe(true)
      expect(canManageEvents(adminRoles)).toBe(true)
      expect(canManageAccounts(adminRoles)).toBe(true)
      expect(canManageAudits(adminRoles)).toBe(true)
      expect(canManageAssets(adminRoles)).toBe(true)
      expect(canManageRoles(adminRoles)).toBe(true)
    })
  })

  describe('会員管理権限 (canManageMembers)', () => {
    it('会長・副会長・会員管理担当・システム管理者の4者は許可される', () => {
      expect(canManageMembers([ROLES.PRESIDENT])).toBe(true)
      expect(canManageMembers([ROLES.VICE_PRESIDENT])).toBe(true)
      expect(canManageMembers([ROLES.MEMBER_MANAGER])).toBe(true)
      expect(canManageMembers([ROLES.SYSTEM_ADMIN])).toBe(true)
    })

    it('上記4者以外のロールは「拒否」される', () => {
      expect(canManageMembers([ROLES.ANNOUNCEMENT_MANAGER])).toBe(false)
      expect(canManageMembers([ROLES.ACCOUNTANT])).toBe(false)
    })

    it('兼務（rolesの中に許可ロールが含まれる）なら許可される', () => {
      expect(
        canManageMembers([ROLES.ANNOUNCEMENT_MANAGER, ROLES.MEMBER_MANAGER])
      ).toBe(true)
    })
  })

  describe('ロール判定 (hasRole)', () => {
    it('Memberオブジェクトの roles プロパティを正しく判定できること', () => {
      const user: Member = {
        id: 'u1',
        roles: [ROLES.MEMBER_MANAGER, ROLES.PRESIDENT],
        name: '',
        name_roma: '',
        nickname: '',
        email: '',
        status: 'active',
        member_number: '1',
        member_kind: 'general',
        emg_tel: '',
        emg_rel: '',
      }


      expect(hasRole(user, ROLES.MEMBER_MANAGER)).toBe(true)
      expect(hasRole(user, ROLES.PRESIDENT)).toBe(true)
    })

    it('持っていないロールの場合は false を返すこと', () => {
      const user: Member = {
        id: 'u1',
        roles: ['member'],
        name: '',
        name_roma: '',
        nickname: '',
        email: '',
        status: 'active',
        member_number: '1',
        member_kind: 'general',
        emg_tel: '',
        emg_rel: '',
      }


      expect(hasRole(user, ROLES.MEMBER_MANAGER)).toBe(false)
    })
  })

  describe('GAS設計準拠：ログイン可否判定 (canLogin)', () => {
    it('ACTIVEやNEWなどの許可されたステータスは true', () => {
      expect(canLogin('active')).toBe(true)
      expect(canLogin('new_req')).toBe(true)
      expect(canLogin('suspended')).toBe(true)
    })

    it('rejected や withdraw などの終了ステータスは false', () => {
      expect(canLogin('rejected')).toBe(false)
      expect(canLogin('withdrawn')).toBe(false)
    })
  })

  describe('大文字小文字・異常系の厳密判定', () => {
    it('nullや空文字の場合はすべてfalseを返すこと', () => {
      expect(canManageMembers(null)).toBe(false)
      expect(canManageMembers([])).toBe(false)
    })

    it('DBの値（小文字スネークケース）と完全一致する必要があること', () => {
      expect(canManageMembers(['PRESIDENT'])).toBe(false)
      expect(canManageMembers(['president'])).toBe(true)
    })
  })
})
