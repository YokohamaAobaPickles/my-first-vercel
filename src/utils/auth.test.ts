/**
 * Filename: utils/auth.test.ts
 * Version : V1.2.1
 * Update  : 2026-01-21 
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
  ROLES 
} from './auth'

describe('権限判定ロジックの詳細テスト', () => {

  describe('会員管理権限 (canManageMembers)', () => {
    it('会長・副会長・会員担当・システム管理者は許可される', () => {
      expect(canManageMembers(ROLES.PRESIDENT)).toBe(true);
      expect(canManageMembers(ROLES.VICE_PRESIDENT)).toBe(true); // 修正: canManageAnnouncementsになっていた箇所
      expect(canManageMembers(ROLES.MEMBER_MANAGER)).toBe(true);
      expect(canManageMembers(ROLES.SYSTEM_ADMIN)).toBe(true);
    });

    it('許可されたロール以外は「拒否」される', () => {
      expect(canManageMembers(ROLES.ANNOUNCEMENT_MANAGER)).toBe(false);
      expect(canManageMembers(ROLES.EVENT_MANAGER)).toBe(false);
      expect(canManageMembers(ROLES.ACCOUNTANT)).toBe(false);
      expect(canManageMembers('一般会員')).toBe(false);
      expect(canManageMembers(null)).toBe(false);
    });

    it('兼務（MEMBER_MANAGERが含まれる）なら許可される', () => {
      expect(canManageMembers('ANNOUNCEMENT_MANAGER, MEMBER_MANAGER')).toBe(true);
    });
  });

  describe('お知らせ管理権限 (canManageAnnouncements)', () => {
    it('会長・副会長・お知らせ担当・システム管理者は許可される', () => {
      expect(canManageAnnouncements(ROLES.PRESIDENT)).toBe(true);
      expect(canManageAnnouncements(ROLES.VICE_PRESIDENT)).toBe(true);
      expect(canManageAnnouncements(ROLES.ANNOUNCEMENT_MANAGER)).toBe(true);
      expect(canManageAnnouncements(ROLES.SYSTEM_ADMIN)).toBe(true);
    });

    it('許可されたロール以外は「拒否」される', () => {
      expect(canManageAnnouncements(ROLES.MEMBER_MANAGER)).toBe(false); // 修正: canManageMembersになっていた箇所
      expect(canManageAnnouncements(ROLES.EVENT_MANAGER)).toBe(false);
    });
  });

  describe('その他の専用権限', () => {
    it('会計担当のみ会計管理ができる(会長・副会長・システム管理者除く)', () => {
      expect(canManageAccounts(ROLES.ACCOUNTANT)).toBe(true);
      expect(canManageAccounts(ROLES.MEMBER_MANAGER)).toBe(false);
    });

    it('監査担当のみ監査ができる(会長・副会長・システム管理者除く)', () => {
      expect(canManageAudits(ROLES.AUDITOR)).toBe(true);
      expect(canManageAudits(ROLES.ACCOUNTANT)).toBe(false);
    });

    it('資産管理担当のみ資産管理ができる(会長・副会長・システム管理者除く)', () => {
      expect(canManageAssets(ROLES.ASSET_MANAGER)).toBe(true);
      expect(canManageAssets(ROLES.PRESIDENT)).toBe(true);
    });
  });

  describe('SYSTEM_ADMINの全権限テスト', () => {
    const admin = ROLES.SYSTEM_ADMIN;
    it('すべての管理関数でtrueを返すこと', () => {
      expect(canManageRoles(admin)).toBe(true);
      expect(canManageMembers(admin)).toBe(true);
      expect(canManageAnnouncements(admin)).toBe(true);
      expect(canManageEvents(admin)).toBe(true);
      expect(canManageAccounts(admin)).toBe(true);
      expect(canManageAudits(admin)).toBe(true);
      expect(canManageAssets(admin)).toBe(true);
    });
  });

  describe('異常系・境界値テスト', () => {
    it('nullや空文字の場合はすべてfalseを返すこと', () => {
      expect(canManageAnnouncements(null)).toBe(false);
      expect(canManageAnnouncements('')).toBe(false);
    });

    it('大文字小文字が混在していても判定できること(ロジック側にtoUpperCaseを入れた場合)', () => {
      // 判定ロジック側に .toUpperCase() を入れている場合はここを通る
      expect(canManageAnnouncements('announcement_manager')).toBe(true);
    });
  });
});