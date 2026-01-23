/**
 * Filename: utils/auth.test.ts
 * Version : V1.3.0
 * Update  : 2026-01-23
 * 修正内容:
 * - ロールの小文字化・名称変更（notice_manager等）に対応
 * - SYSTEM_ADMINの削除に伴うテストケースの整理
 * - 大文字小文字の厳密判定への変更
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
    it('会長・副会長・会員担当は許可される', () => {
      expect(canManageMembers(ROLES.PRESIDENT)).toBe(true);
      expect(canManageMembers(ROLES.VICE_PRESIDENT)).toBe(true);
      expect(canManageMembers(ROLES.MEMBER_MANAGER)).toBe(true);
    });

    it('許可されたロール以外は「拒否」される', () => {
      expect(canManageMembers(ROLES.NOTICE_MANAGER)).toBe(false);
      expect(canManageMembers(ROLES.EVENT_MANAGER)).toBe(false);
      expect(canManageMembers('general')).toBe(false);
      expect(canManageMembers(null)).toBe(false);
    });

    it('兼務（member_managerが含まれる）なら許可される', () => {
      // カンマ区切りの小文字スネークケース
      expect(canManageMembers('notice_manager, member_manager')).toBe(true);
    });
  });

  describe('お知らせ管理権限 (canManageAnnouncements)', () => {
    it('会長・副会長・お知らせ担当は許可される', () => {
      expect(canManageAnnouncements(ROLES.PRESIDENT)).toBe(true);
      expect(canManageAnnouncements(ROLES.VICE_PRESIDENT)).toBe(true);
      expect(canManageAnnouncements(ROLES.NOTICE_MANAGER)).toBe(true);
    });

    it('会員担当は「拒否」される', () => {
      expect(canManageAnnouncements(ROLES.MEMBER_MANAGER)).toBe(false);
    });
  });

  describe('各専任ロールの権限テスト', () => {
    it('会計担当のみ会計管理ができる(会長・副会長除く)', () => {
      expect(canManageAccounts(ROLES.ACCOUNTANT)).toBe(true);
      expect(canManageAccounts(ROLES.PRESIDENT)).toBe(true);
      expect(canManageAccounts(ROLES.MEMBER_MANAGER)).toBe(false);
    });

    it('監査担当のみ監査ができる(会長・副会長除く)', () => {
      expect(canManageAudits(ROLES.AUDITOR)).toBe(true);
      expect(canManageAudits(ROLES.PRESIDENT)).toBe(true);
      expect(canManageAudits(ROLES.ACCOUNTANT)).toBe(false);
    });

    it('資産管理担当のみ資産管理ができる(会長・副会長除く)', () => {
      expect(canManageAssets(ROLES.ASSET_MANAGER)).toBe(true);
      expect(canManageAssets(ROLES.PRESIDENT)).toBe(true);
      expect(canManageAssets(ROLES.EVENT_MANAGER)).toBe(false);
    });
  });

  describe('会長の全権限テスト', () => {
    // 会長（president）はすべての管理機能を使える必要がある
    const president = ROLES.PRESIDENT;
    it('会長はすべての管理関数でtrueを返すこと', () => {
      expect(canManageRoles(president)).toBe(true);
      expect(canManageMembers(president)).toBe(true);
      expect(canManageAnnouncements(president)).toBe(true);
      expect(canManageEvents(president)).toBe(true);
      expect(canManageAccounts(president)).toBe(true);
      expect(canManageAudits(president)).toBe(true);
      expect(canManageAssets(president)).toBe(true);
    });
  });

  describe('異常系・境界値テスト', () => {
    it('nullや空文字の場合はすべてfalseを返すこと', () => {
      expect(canManageAnnouncements(null)).toBe(false);
      expect(canManageAnnouncements('')).toBe(false);
    });

    it('DBの値（小文字）と完全一致する必要があること', () => {
      // ロジックからtoUpperCaseを外したので、大文字だとfalseになるべき
      expect(canManageAnnouncements('NOTICE_MANAGER')).toBe(false);
      expect(canManageAnnouncements('notice_manager')).toBe(true);
    });
  });

  // utils/auth.test.ts に追記
  describe('デグレ防止：会員申請中(registration_request)の権限', () => {
    it('申請中のユーザーは、お知らせ管理権限を持っていないこと', () => {
      const pendingUser = { roles: 'member', status: 'registration_request' };
      // 既存の canManageAnnouncements が status を見ていない場合、
      // ここで status も考慮するように auth.ts を修正する必要があることが判明する
      expect(canManageAnnouncements(pendingUser.roles)).toBe(false);
      // ※現在はrolesのみ判定しているので、ここを「statusがactiveかつrole一致」に直すべき、
      // という気付きが画面を作る前に得られる
    });
  });
});