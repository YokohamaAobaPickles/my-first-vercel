/**
 * Filename: facilityHelpers.test.ts
 * Version: V1.3.0
 * Update: 2026-03-03
 * Remarks: 
 * V1.3.0 - F-03 登録団体削除のロジックテストを追加
 * V1.2.0 - F-04 登録団体一覧取得のロジックテストを追加
 * V1.1.0 - F-02 登録団体更新のロジックテストを追加
 * V1.0.0 - F-01〜F-03 登録団体情報のビジネスロジックに関するテスト。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  createRegistrationGroup,
  updateRegistrationGroupInfo,
  getRegistrationGroups,
  removeRegistrationGroup
} from '@/utils/facilityHelpers';

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

  describe('F-02: 登録団体情報の更新', () => {
    it('名称を書き換えたとき、正しく更新されたデータを返す', async () => {
      // テスト用の土台作成
      const newGroup = await createRegistrationGroup({
        registration_club_name: 'Helper更新前',
        registration_club_number: 'H-UPD-001',
        representative_id: null,
        vice_representative_id: null,
        registration_club_notes: 'Helperテスト'
      });

      const updateData = { registration_club_name: 'Helper更新後' };
      const result = await updateRegistrationGroupInfo(newGroup!.id, updateData);

      expect(result).not.toBeNull();
      expect(result?.registration_club_name).toBe('Helper更新後');
    });

    it('存在しないIDを指定した場合、nullを返す', async () => {
      const result = await updateRegistrationGroupInfo('non-existent-uuid', {
        registration_club_name: '無効な更新'
      });
      expect(result).toBeNull();
    });
  });

});

describe('F-03: 登録団体情報の削除', () => {
  it('存在するIDを指定したとき、正常に削除され true を返す', async () => {
    // テスト用データ作成
    const newGroup = await createRegistrationGroup({
      registration_club_name: 'Helper削除テスト',
      registration_club_number: 'H-DEL-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: 'Helper削除用'
    });

    // 削除実行
    const result = await removeRegistrationGroup(newGroup!.id);
    expect(result).toBe(true);

    // DBに存在しないことを物理的に確認
    const { data } = await supabase
      .from('registration_groups')
      .select('*')
      .eq('id', newGroup!.id)
      .single();

    expect(data).toBeNull();
  });

  it('空のIDを指定したとき、false を返す', async () => {
    const result = await removeRegistrationGroup('');
    expect(result).toBe(false);
  });
});

describe('F-04: 登録団体一覧の取得', () => {
  it('登録済みの団体リストを取得し、配列であることを確認する', async () => {
    const list = await getRegistrationGroups();

    expect(Array.isArray(list)).toBe(true);
    // 1件以上あるはず（これまでのテストで作成されているため）
    expect(list.length).toBeGreaterThan(0);
  });
});