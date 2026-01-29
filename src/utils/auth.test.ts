/**
 * Filename: src/utils/auth.test.ts
 * Version : V2.0.0
 * Update  : 2026-01-27
 * 修正内容:
 * V2.0.0
 * - src/types/member.ts の Member 型を導入し、@ts-ignore を完全に排除
 * - プロパティ名を role -> roles (複数形) に統一
 * - GAS設計(Z_StatusFlow.js)に基づいた canLogin ステータス判定テストを追加
 * V1.5.0
 * - canManageMembers と hasRole の追加テストケースを実装
 * V1.4.2
 * - SYSTEM_ADMIN のテストケースを復活
 * V1.3.0
 * - ロールの小文字化・名称変更に対応
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
  canLogin,    // 新規追加
  hasRole
} from './auth'
import { ROLES, Member } from '@/types/member'

describe('権限判定ロジックの詳細テスト V2.0.0', () => {

  describe('システム管理者 (SYSTEM_ADMIN) の全能性テスト', () => {
    const adminRole = ROLES.SYSTEM_ADMIN; 

    it('システム管理者は、全ての管理機能に対して true を返すこと', () => {
      expect(canManageMembers(adminRole)).toBe(true);
      expect(canManageAnnouncements(adminRole)).toBe(true);
      expect(canManageEvents(adminRole)).toBe(true);
      expect(canManageAccounts(adminRole)).toBe(true);
      expect(canManageAudits(adminRole)).toBe(true);
      expect(canManageAssets(adminRole)).toBe(true);
      expect(canManageRoles(adminRole)).toBe(true);
    });
  });

  describe('会員管理権限 (canManageMembers)', () => {
    it('会長・副会長・会員管理担当・システム管理者の4者は許可される', () => {
      expect(canManageMembers(ROLES.PRESIDENT)).toBe(true);
      expect(canManageMembers(ROLES.VICE_PRESIDENT)).toBe(true);
      expect(canManageMembers(ROLES.MEMBER_MANAGER)).toBe(true);
      expect(canManageMembers(ROLES.SYSTEM_ADMIN)).toBe(true);
    });

    it('上記4者以外のロールは「拒否」される', () => {
      expect(canManageMembers(ROLES.ANNOUNCEMENT_MANAGER)).toBe(false);
      expect(canManageMembers(ROLES.ACCOUNTANT)).toBe(false);
    });

    it('兼務（rolesの中に許可ロールが含まれる）なら許可される', () => {
      // カンマ区切りの複数ロール判定を検証
      expect(canManageMembers('announcement_manager, member_manager')).toBe(true);
    });
  });

  describe('ロール判定 (hasRole)', () => {
    it('Memberオブジェクトの roles プロパティを正しく判定できること', () => {
      // roles (複数形) であることを型レベルで検証
      const user = { roles: 'member_manager, president' } as Member;
      expect(hasRole(user, ROLES.MEMBER_MANAGER)).toBe(true);
      expect(hasRole(user, ROLES.PRESIDENT)).toBe(true);
    });

    it('持っていないロールの場合は false を返すこと', () => {
      const user = { roles: 'general' } as Member;
      expect(hasRole(user, ROLES.MEMBER_MANAGER)).toBe(false);
    });
  });

  describe('GAS設計準拠：ログイン可否判定 (canLogin)', () => {
    it('ACTIVEやNEWなどの許可されたステータスは true', () => {
      expect(canLogin('active')).toBe(true);
      expect(canLogin('new_req')).toBe(true);
      expect(canLogin('suspended')).toBe(true); // 休会中も復帰申請のため許可
    });

    it('rejected や retired などの終了ステータスは false', () => {
      expect(canLogin('rejected')).toBe(false);
      expect(canLogin('retired')).toBe(false);
    });
  });

  describe('大文字小文字・異常系の厳密判定', () => {
    it('nullや空文字の場合はすべてfalseを返すこと', () => {
      expect(canManageMembers(null)).toBe(false);
      expect(canManageMembers('')).toBe(false);
    });

    it('DBの値（小文字スネークケース）と完全一致する必要があること', () => {
      expect(canManageMembers('PRESIDENT')).toBe(false);
      expect(canManageMembers('president')).toBe(true);
    });
  });
});