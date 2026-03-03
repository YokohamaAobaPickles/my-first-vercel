/**
 * Filename: facilityApi.test.ts
 * Version: V1.5.0
 * Update: 2026-03-03
 * Remarks: 
 * V1.5.0 - updateFacility のテストケースを追加
 * V1.4.0 - F-11 施設新規登録のテストケースを追加
 * V1.3.2 - テスト実行後にクリーンアップ処理を追加
 * V1.3.1 - 削除の確実性を検証するステップを追加 
 * V1.3.0 - F-03 登録団体削除のテストケースを追加
 * V1.2.0 - F-04 登録団体一覧取得のテストケースを追加
 * V1.1.0 - F-02 登録団体更新のテストケースを追加
 * V1.0.1 - 外部キー制約エラー回避のためテストデータを修正
 */

import { describe, it, expect, afterAll} from 'vitest';
import {
  insertRegistrationGroup,
  updateRegistrationGroup,
  fetchAllRegistrationGroups,
  deleteRegistrationGroup,
  insertFacility
} from '@/lib/facilityApi';
import { supabase } from '@/lib/supabase';

describe('facilityApi: 登録団体DB操作のテスト', () => {
  // テスト中に作成したIDを記録する配列
  const createdIds: string[] = [];

  // 補助関数：作成したIDを記録しながらinsertする
  const insertWithCleanup = async (input: any) => {
    const res = await insertRegistrationGroup(input);
    if (res?.id) createdIds.push(res.id);
    return res;
  };

  // 全てのテストが終わったら、記録したIDをすべて削除する
  afterAll(async () => {
    for (const id of createdIds) {
      await deleteRegistrationGroup(id);
    }
    console.log(`${createdIds.length}件のテストデータを清掃しました。`);
  });

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

  describe('updateRegistrationGroup', () => {
    it('既存の団体情報を指定して、名称を更新できること', async () => {
      // F-01で作成されたテストデータのIDを取得（または固定のテストID）
      // ここではテストの独立性を保つため、一度作成してから更新する流れが理想です
      const newGroup = await insertRegistrationGroup({
        registration_club_name: '更新前団体',
        registration_club_number: 'UPD-000',
        representative_id: null,
        vice_representative_id: null,
        registration_club_notes: '更新テスト'
      });

      const updateData = { registration_club_name: '更新後団体' };
      const result = await updateRegistrationGroup(newGroup!.id, updateData);

      expect(result).not.toBeNull();
      expect(result?.registration_club_name).toBe('更新後団体');
    });
  });

  describe('fetchAllRegistrationGroups', () => {
    it('登録済みの団体リストを配列で取得できること', async () => {
      // 少なくとも1件はデータが存在することを期待（これまでのテストで入っているはず）
      const list = await fetchAllRegistrationGroups();

      expect(Array.isArray(list)).toBe(true);
      if (list && list.length > 0) {
        expect(list[0]).toHaveProperty('registration_club_name');
        expect(list[0]).toHaveProperty('id');
      }
    });
  });

  it('指定したIDの団体情報を削除し、その後取得できないこと', async () => {
    // 1. テスト用のデータをその場で作る（既存データを使うと他のテストに影響するため）
    const target = await insertRegistrationGroup({
      registration_club_name: '削除団体',
      registration_club_number: 'UPD-999',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: '削除テスト'
    });

    // 2. 削除実行
    const isDeleted = await deleteRegistrationGroup(target!.id);
    expect(isDeleted).toBe(true);

    // 3. 【重要】再取得を試みる
    const { data } = await supabase
      .from('registration_groups')
      .select('*')
      .eq('id', target!.id)
      .single();

    // データが見つからない（errorがある、またはdataがnull）ことを期待する
    expect(data).toBeNull();
  });
});

describe('F-11: 施設登録 (facilityApi)', () => {
  it('正しい施設データが渡されたとき、DB登録に成功してデータを返す', async () => {
    // 1. 紐付け用の団体を先に作成
    const group = await insertRegistrationGroup({
      registration_club_name: '施設紐付け用団体',
      registration_club_number: 'FAC-000',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: 'Test'
    });

    const mockFacility = {
      facility_name: 'テストコートA',
      address: '東京都渋谷区...',
      map_url: 'https://maps.google.com/...',
      facility_notes: 'ハードコート2面',
      registration_group_id: group!.id // 作成した団体のIDを指定
    };

    // 2. 施設登録実行
    const result = await insertFacility(mockFacility);

    expect(result).not.toBeNull();
    expect(result?.facility_name).toBe(mockFacility.facility_name);
    expect(result?.registration_group_id).toBe(group!.id);
    expect(result?.id).toBeDefined();
  });
});