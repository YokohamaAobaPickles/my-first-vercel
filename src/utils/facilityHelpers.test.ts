/**
 * Filename: facilityHelpers.test.ts
 * Version: V1.0.0
 * Update: 2026-03-03
 * Remarks: V1.0.0 - F-01〜F-03 登録団体情報のビジネスロジックに関するテスト。
 * テストファーストに基づき、実装前に作成。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRegistrationGroup } from '@/utils/facilityHelpers';

// 必要に応じてAPI側のモック化を検討しますが、まずは素直に呼び出します
describe('facilityHelpers: 登録団体ロジックのテスト', () => {

  describe('F-01: 登録団体情報の登録', () => {
    it('正しい入力データが与えられたとき、登録に成功して登録済みのデータを返す', 
    async () => {
      const inputData = {
        registration_club_name: '横浜ピックルボールクラブ',
        registration_club_number: 'YPC-2026',
        representative_id: '1001', // 代表者会員番号
        vice_representative_id: '1005', // 副代表者会員番号
        registration_club_notes: 'テスト用団体情報'
      };

      const result = await createRegistrationGroup(inputData);

      // 現時点では実装がない（またはnullを返す）ため、ここでFailする
      expect(result).not.toBeNull();
      expect(result?.registration_club_name).toBe(inputData.registration_club_name);
      expect(result?.id).toBeDefined(); // UUIDが発行されていること
    });

    it('必須項目（団体名）が欠けている場合、エラーまたはnullを返す', async () => {
      const invalidData = {
        registration_club_name: '', // 不正な入力
        registration_club_number: 'ERR-001',
        representative_id: '0001',
        vice_representative_id: null,
        registration_club_notes: null
      };

      const result = await createRegistrationGroup(invalidData);
      
      // バリデーション未実装のため、ここでも期待と異なる挙動でFailする
      expect(result).toBeNull();
    });
  });
});