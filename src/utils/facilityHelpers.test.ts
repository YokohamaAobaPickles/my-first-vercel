/**
 * Filename: facilityHelpers.test.ts
 * Version: V1.7.0
 * Update: 2026-03-03
 * Remarks:
 * V1.7.0 - F-21〜F-24 施設予約管理のテスト追加
 * V1.6.0 - F-13, F-14 施設削除・一覧取得のテスト追加
 * V1.5.1 - 施設更新のテストを Helper 層の命名に修正
 * V1.5.0 - F-12 施設情報更新のテストケースを追加
 * V1.4.0 - F-11 施設登録のロジックテストを追加
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
  removeRegistrationGroup,
  createFacility,
  updateFacilityInfo,
  removeFacility,
  getFacilities,
  createReservation,
  updateReservationInfo,
  removeReservation,
  getReservations
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

describe('facilityHelpers: 施設管理ロジックのテスト', () => {
  it('F-11: 正しいデータで施設を登録できる', async () => {
    // 紐付け用の団体を作成
    const group = await createRegistrationGroup({
      registration_club_name: 'Helper施設テスト団体',
      registration_club_number: 'H-FAC-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: 'Notes'
    });

    const facilityData = {
      facility_name: 'ヘルパーテストコート',
      address: '横浜市...',
      map_url: null,
      facility_notes: 'テスト',
      registration_group_id: group!.id
    };

    const result = await createFacility(facilityData);

    expect(result).not.toBeNull();
    expect(result?.facility_name).toBe('ヘルパーテストコート');
  });

  it('F-11: 施設名が空の場合は登録を拒否し null を返す', async () => {
    const result = await createFacility({
      facility_name: '', // 不正なデータ
      address: null,
      map_url: null,
      facility_notes: null,
      registration_group_id: null
    });
    expect(result).toBeNull();
  });

  describe('F-12: 施設更新ロジック', () => {
    it('既存の施設名を変更したとき、正常に更新データを返す', async () => {
      // 1. Helper を使ってテスト用の施設を作成
      const newFacility = await createFacility({
        facility_name: '更新前コート',
        address: '住所A',
        map_url: null,
        facility_notes: null,
        registration_group_id: null
      });

      // 2. updateFacilityInfo を実行
      const updateData = { facility_name: '更新後コート' };
      const result = await updateFacilityInfo(newFacility!.id, updateData);

      expect(result).not.toBeNull();
      expect(result?.facility_name).toBe('更新後コート');
    });

    it('施設名を空文字に更新しようとした場合、null を返す', async () => {
      const f = await createFacility({
        facility_name: 'バリデーションテスト',
        address: null,
        map_url: null,
        facility_notes: null,
        registration_group_id: null
      });

      const result = await updateFacilityInfo(f!.id, { facility_name: '' });
      expect(result).toBeNull();
    });
  });

  describe('F-13: 施設情報の削除', () => {
    it('存在するIDを指定したとき、正常に削除され true を返す', async () => {
      const newFacility = await createFacility({
        facility_name: 'Helper削除テスト施設',
        address: '横浜市...',
        map_url: null,
        facility_notes: 'F-13 Helper削除用',
        registration_group_id: null
      });

      const result = await removeFacility(newFacility!.id);
      expect(result).toBe(true);

      const { data } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', newFacility!.id)
        .single();

      expect(data).toBeNull();
    });

    it('空のIDを指定したとき、false を返す', async () => {
      const result = await removeFacility('');
      expect(result).toBe(false);
    });
  });

  describe('F-14: 施設一覧の取得', () => {
    it('登録済みの施設リストを取得し、配列であることを確認する', async () => {
      const list = await getFacilities();

      expect(Array.isArray(list)).toBe(true);
      // 1件以上あるはず（これまでのテストで作成されているため）
      expect(list.length).toBeGreaterThan(0);
    });
  });

  describe('F-21〜F-24: 施設予約管理ロジック', () => {
    describe('F-21: createReservation', () => {
      it('reservation_date, reservation_time_slot, reserved_courts, ' +
         'reserved_fee を含む正常系で登録に成功すること', async () => {
        const group = await createRegistrationGroup({
          registration_club_name: 'Helper予約テスト団体',
          registration_club_number: 'H-RES-001',
          representative_id: null,
          vice_representative_id: null,
          registration_club_notes: null
        });
        const facility = await createFacility({
          facility_name: 'Helper予約テストコート',
          address: null,
          map_url: null,
          facility_notes: null,
          registration_group_id: group!.id
        });

        const reservationData = {
          facility_id: facility!.id,
          registration_group_id: group!.id,
          reservation_number: null,
          reservation_date: '2026-05-01',
          reservation_time_slot: '13:00-15:00',
          reserved_courts: 2,
          reserved_fee: 5000,
          reservation_limit: null,
          reserver_name: null,
          lottery_results: null,
          reservation_notes: 'Helperテスト'
        };

        const result = await createReservation(reservationData);

        expect(result).not.toBeNull();
        expect(result?.reservation_date).toBe(reservationData.reservation_date);
        expect(result?.reserved_courts).toBe(reservationData.reserved_courts);
        expect(result?.reserved_fee).toBe(reservationData.reserved_fee);
        expect(result?.id).toBeDefined();
      });

      it('reserved_courts が 0 以下のとき null を返す', async () => {
        const group = await createRegistrationGroup({
          registration_club_name: 'Helper予約バリデーション団体',
          registration_club_number: 'H-RES-VAL',
          representative_id: null,
          vice_representative_id: null,
          registration_club_notes: null
        });
        const facility = await createFacility({
          facility_name: 'バリデーションコート',
          address: null,
          map_url: null,
          facility_notes: null,
          registration_group_id: group!.id
        });

        const result = await createReservation({
          facility_id: facility!.id,
          registration_group_id: group!.id,
          reservation_number: null,
          reservation_date: '2026-05-02',
          reservation_time_slot: '10:00-12:00',
          reserved_courts: 0,
          reserved_fee: 0,
          reservation_limit: null,
          reserver_name: null,
          lottery_results: null,
          reservation_notes: null
        });

        expect(result).toBeNull();
      });
    });

    describe('F-22: updateReservationInfo', () => {
      it('既存の予約情報を更新したとき、更新データを返す', async () => {
        const group = await createRegistrationGroup({
          registration_club_name: 'Helper予約更新テスト団体',
          registration_club_number: 'H-RES-UPD',
          representative_id: null,
          vice_representative_id: null,
          registration_club_notes: null
        });
        const facility = await createFacility({
          facility_name: '予約更新テストコート',
          address: null,
          map_url: null,
          facility_notes: null,
          registration_group_id: group!.id
        });
        const newReservation = await createReservation({
          facility_id: facility!.id,
          registration_group_id: group!.id,
          reservation_number: null,
          reservation_date: '2026-05-03',
          reservation_time_slot: '09:00-11:00',
          reserved_courts: 1,
          reserved_fee: 3000,
          reservation_limit: null,
          reserver_name: null,
          lottery_results: null,
          reservation_notes: null
        });
        if (!newReservation) throw new Error('setup failed');

        const updateData = { reserved_fee: 3500 };
        const result = await updateReservationInfo(
          newReservation.id,
          updateData
        );

        expect(result).not.toBeNull();
        expect(result?.reserved_fee).toBe(3500);
      });
    });

    describe('F-23: removeReservation', () => {
      it('存在するIDを指定したとき、正常に削除され true を返す', async () => {
        const group = await createRegistrationGroup({
          registration_club_name: 'Helper予約削除テスト団体',
          registration_club_number: 'H-RES-DEL',
          representative_id: null,
          vice_representative_id: null,
          registration_club_notes: null
        });
        const facility = await createFacility({
          facility_name: '予約削除テストコート',
          address: null,
          map_url: null,
          facility_notes: null,
          registration_group_id: group!.id
        });
        const newReservation = await createReservation({
          facility_id: facility!.id,
          registration_group_id: group!.id,
          reservation_number: null,
          reservation_date: '2026-05-04',
          reservation_time_slot: '14:00-16:00',
          reserved_courts: 1,
          reserved_fee: 2000,
          reservation_limit: null,
          reserver_name: null,
          lottery_results: null,
          reservation_notes: null
        });
        if (!newReservation) throw new Error('setup failed');

        const result = await removeReservation(newReservation.id);
        expect(result).toBe(true);

        const { data } = await supabase
          .from('facility_reservations')
          .select('*')
          .eq('id', newReservation.id)
          .single();

        expect(data).toBeNull();
      });

      it('空のIDを指定したとき、false を返す', async () => {
        const result = await removeReservation('');
        expect(result).toBe(false);
      });
    });

    describe('F-24: getReservations', () => {
      it('予約一覧を reservation_date の昇順で取得し、配列であること',
        async () => {
          const list = await getReservations();

          expect(Array.isArray(list)).toBe(true);
          if (list && list.length >= 2) {
            for (let i = 0; i < list.length - 1; i++) {
              expect(
                list[i].reservation_date <= list[i + 1].reservation_date
              ).toBe(true);
            }
          }
        });
    });
  });
});