/**
 * Filename: facilityApi.test.ts
 * Version: V1.0.1
 * Update: 2026-03-03
 * Remarks: V1.0.1 - 外部キー制約エラー回避のためテストデータを修正
 */

import { describe, it, expect } from 'vitest';
import { insertRegistrationGroup } from '@/lib/facilityApi';

describe('facilityApi: 登録団体DB操作のテスト', () => {
  it('正しいデータが渡されたとき、DB登録に成功してデータを返す', async () => {
    const mockInput = {
      registration_club_name: 'TDDテスト団体',
      registration_club_number: 'TDD-001',
      // 一旦 null にして外部キー制約を回避（または実在するIDを指定）
      representative_id: null, 
      vice_representative_id: null,
      registration_club_notes: 'API単体テスト'
    };

    const result = await insertRegistrationGroup(mockInput);

    expect(result).not.toBeNull();
    expect(result?.registration_club_name).toBe(mockInput.registration_club_name);
    expect(result?.id).toBeDefined();
  });
});