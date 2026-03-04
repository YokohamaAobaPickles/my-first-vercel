/**
 * Filename: facilityApi.test.ts
 * Version: V1.8.0
 * Update: 2026-03-04
 * Remarks:
 * V1.8.0 - 個別取得テスト追加と命名整理。
 * V1.7.0 - F-21〜F-24 施設予約管理のテスト追加
 * V1.6.0 - F-13, F-14 施設削除・一覧取得のテスト追加
 * V1.5.0 - updateFacility のテストケースを追加
 * V1.4.0 - F-11 施設新規登録のテストケースを追加
 * V1.3.2 - テスト実行後にクリーンアップ処理を追加
 * V1.3.1 - 削除の確実性を検証するステップを追加
 * V1.3.0 - F-03 登録団体削除のテストケースを追加
 * V1.2.0 - F-04 登録団体一覧取得のテストケースを追加
 * V1.1.0 - F-02 登録団体更新のテストケースを追加
 * V1.0.1 - 外部キー制約エラー回避のためテストデータを修正
 */

import { describe, it, expect, afterAll } from 'vitest';
import {
  insertRegistrationGroup,
  updateRegistrationGroup,
  fetchAllRegistrationGroups,
  deleteRegistrationGroup,
  insertFacility,
  deleteFacility,
  fetchAllFacilities,
  insertReservation,
  updateReservation,
  deleteReservation,
  fetchAllReservations,
  fetchRegistrationGroupById,
  fetchFacilityById,
  fetchReservationById,
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

  it('作成した団体を ID 指定で取得できること', async () => {
    const input = {
      registration_club_name: 'ID取得団体',
      registration_club_number: 'FETCH-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: 'ID取得テスト'
    };

    const created = await insertRegistrationGroup(input);
    const fetched = await fetchRegistrationGroupById(
      created!.id
    );

    expect(fetched).not.toBeNull();
    expect(fetched?.registration_club_name)
      .toBe(input.registration_club_name);
    expect(fetched?.id).toBe(created!.id);
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

describe('F-13 / F-14: 施設削除・一覧取得 (facilityApi)', () => {
  const createdGroupIds: string[] = [];

  const insertGroupWithCleanup = async (input: Parameters<
    typeof insertRegistrationGroup
  >[0]) => {
    const res = await insertRegistrationGroup(input);
    if (res?.id) createdGroupIds.push(res.id);
    return res;
  };

  afterAll(async () => {
    for (const id of createdGroupIds) {
      await deleteRegistrationGroup(id);
    }
    if (createdGroupIds.length > 0) {
      console.log(
        `${createdGroupIds.length}件の施設テスト用団体を清掃しました。`
      );
    }
  });

  describe('F-14: fetchAllFacilities', () => {
    it('登録済みの施設リストを配列で取得できること', async () => {
      const list = await fetchAllFacilities();

      expect(Array.isArray(list)).toBe(true);
      if (list && list.length > 0) {
        expect(list[0]).toHaveProperty('facility_name');
        expect(list[0]).toHaveProperty('id');
      }
    });
  });

  it('F-14: 作成した施設を ID 指定で取得できること', 
    async () => {
    const group = await insertGroupWithCleanup({
      registration_club_name: '施設ID取得テスト用団体',
      registration_club_number: 'F-FETCH-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: '施設ID取得テスト'
    });

    const created = await insertFacility({
      facility_name: 'ID取得対象施設',
      address: 'テスト住所',
      map_url: null,
      facility_notes: 'F-14 ID取得テスト',
      registration_group_id: group!.id
    });

    const fetched = await fetchFacilityById(
      created!.id
    );

    expect(fetched).not.toBeNull();
    expect(fetched?.facility_name)
      .toBe('ID取得対象施設');
    expect(fetched?.id).toBe(created!.id);
  });

  it('F-13: 指定したIDの施設情報を削除し、その後取得できないこと', async () => {
    const group = await insertGroupWithCleanup({
      registration_club_name: '施設削除テスト用団体',
      registration_club_number: 'F-DEL-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: '削除テスト'
    });

    const target = await insertFacility({
      facility_name: '削除対象施設',
      address: '東京都...',
      map_url: null,
      facility_notes: 'F-13テスト',
      registration_group_id: group!.id
    });

    const isDeleted = await deleteFacility(target!.id);
    expect(isDeleted).toBe(true);

    const { data } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', target!.id)
      .single();

    expect(data).toBeNull();
  });
});

describe('F-21〜F-24: 施設予約管理 (facilityApi)', () => {
  const createdGroupIds: string[] = [];
  const createdFacilityIds: string[] = [];
  const createdReservationIds: string[] = [];

  const insertGroupWithCleanup = async (input: Parameters<
    typeof insertRegistrationGroup
  >[0]) => {
    const res = await insertRegistrationGroup(input);
    if (res?.id) createdGroupIds.push(res.id);
    return res;
  };

  const insertFacilityWithCleanup = async (input: Parameters<
    typeof insertFacility
  >[0]) => {
    const res = await insertFacility(input);
    if (res?.id) createdFacilityIds.push(res.id);
    return res;
  };

  const insertReservationWithCleanup = async (input: Parameters<
    typeof insertReservation
  >[0]) => {
    const res = await insertReservation(input);
    if (res?.id) createdReservationIds.push(res.id);
    return res;
  };

  afterAll(async () => {
    for (const id of createdReservationIds) {
      await deleteReservation(id);
    }
    for (const id of createdFacilityIds) {
      await deleteFacility(id);
    }
    for (const id of createdGroupIds) {
      await deleteRegistrationGroup(id);
    }
    if (createdReservationIds.length > 0 || createdFacilityIds.length > 0 ||
        createdGroupIds.length > 0) {
      console.log(
        '施設予約テスト用データを清掃しました。'
      );
    }
  });

  describe('F-21: insertReservation', () => {
    it('reservation_date, reservation_time_slot, reserved_courts, ' +
       'reserved_fee を含む正常系で登録に成功すること', async () => {
      const group = await insertGroupWithCleanup({
        registration_club_name: '予約テスト用団体',
        registration_club_number: 'RES-001',
        representative_id: null,
        vice_representative_id: null,
        registration_club_notes: '予約テスト'
      });
      const facility = await insertFacilityWithCleanup({
        facility_name: '予約テストコート',
        address: null,
        map_url: null,
        facility_notes: null,
        registration_group_id: group!.id
      });

      const mockReservation = {
        facility_id: facility!.id,
        registration_group_id: group!.id,
        reservation_number: 'RES-2026-001',
        reservation_date: '2026-04-01',
        reservation_time_slot: '13:00-15:00',
        reserved_courts: 2,
        reserved_fee: 5000,
        reservation_limit: '2026-03-25',
        reserver_name: null,
        lottery_results: null,
        reservation_notes: 'API単体テスト'
      };

      const result = await insertReservationWithCleanup(mockReservation);

      expect(result).not.toBeNull();
      expect(result?.reservation_date).toBe(mockReservation.reservation_date);
      expect(result?.reservation_time_slot).toBe(
        mockReservation.reservation_time_slot
      );
      expect(result?.reserved_courts).toBe(mockReservation.reserved_courts);
      expect(result?.reserved_fee).toBe(mockReservation.reserved_fee);
      expect(result?.id).toBeDefined();
    });
  });

  describe('F-22: updateReservation', () => {
    it('既存の予約情報を指定して更新できること', async () => {
      const group = await insertGroupWithCleanup({
        registration_club_name: '予約更新テスト用団体',
        registration_club_number: 'RES-UPD-001',
        representative_id: null,
        vice_representative_id: null,
        registration_club_notes: null
      });
      const facility = await insertFacilityWithCleanup({
        facility_name: '更新テストコート',
        address: null,
        map_url: null,
        facility_notes: null,
        registration_group_id: group!.id
      });
      const reservation = await insertReservationWithCleanup({
        facility_id: facility!.id,
        registration_group_id: group!.id,
        reservation_number: null,
        reservation_date: '2026-04-02',
        reservation_time_slot: '10:00-12:00',
        reserved_courts: 1,
        reserved_fee: 3000,
        reservation_limit: null,
        reserver_name: null,
        lottery_results: null,
        reservation_notes: null
      });

      const updateData = {
        reservation_time_slot: '14:00-16:00',
        reserved_fee: 4000
      };
      const result = await updateReservation(reservation!.id, updateData);

      expect(result).not.toBeNull();
      expect(result?.reservation_time_slot).toBe('14:00-16:00');
      expect(result?.reserved_fee).toBe(4000);
    });
  });

  it('F-23: 指定したIDの予約を削除し、その後取得できないこと', async () => {
    const group = await insertGroupWithCleanup({
      registration_club_name: '予約削除テスト用団体',
      registration_club_number: 'RES-DEL-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: null
    });
    const facility = await insertFacilityWithCleanup({
      facility_name: '削除テストコート',
      address: null,
      map_url: null,
      facility_notes: null,
      registration_group_id: group!.id
    });
    const target = await insertReservationWithCleanup({
      facility_id: facility!.id,
      registration_group_id: group!.id,
      reservation_number: null,
      reservation_date: '2026-04-03',
      reservation_time_slot: '09:00-11:00',
      reserved_courts: 1,
      reserved_fee: 2000,
      reservation_limit: null,
      reserver_name: null,
      lottery_results: null,
      reservation_notes: null
    });

    const isDeleted = await deleteReservation(target!.id);
    expect(isDeleted).toBe(true);

    const { data } = await supabase
      .from('facility_reservations')
      .select('*')
      .eq('id', target!.id)
      .single();

    expect(data).toBeNull();
  });

  describe('F-24: fetchAllReservations', () => {
    it('作成した予約を ID 指定で取得できること',
      async () => {
        const group = await insertGroupWithCleanup({
          registration_club_name: '予約ID取得テスト用団体',
          registration_club_number: 'RES-FETCH-001',
          representative_id: null,
          vice_representative_id: null,
          registration_club_notes: null
        });
        const facility =
          await insertFacilityWithCleanup({
            facility_name: '予約ID取得テストコート',
            address: null,
            map_url: null,
            facility_notes: null,
            registration_group_id: group!.id
          });
        const reservation =
          await insertReservationWithCleanup({
            facility_id: facility!.id,
            registration_group_id: group!.id,
            reservation_number: 'RES-FETCH-2026',
            reservation_date: '2026-04-10',
            reservation_time_slot: '12:00-14:00',
            reserved_courts: 1,
            reserved_fee: 2500,
            reservation_limit: null,
            reserver_name: null,
            lottery_results: null,
            reservation_notes: null
          });

        const fetched = await fetchReservationById(
          reservation!.id
        );

        expect(fetched).not.toBeNull();
        expect(fetched?.id).toBe(reservation!.id);
        expect(fetched?.reservation_date)
          .toBe('2026-04-10');
      });

    it('予約一覧を reservation_date の昇順（日付が近い順）で取得できること',
      async () => {
        const list = await fetchAllReservations();

        expect(Array.isArray(list)).toBe(true);
        if (list && list.length >= 2) {
          for (let i = 0; i < list.length - 1; i++) {
            expect(
              list[i].reservation_date 
                <= list[i + 1].reservation_date
            ).toBe(true);
          }
        }
        if (list && list.length > 0) {
          expect(list[0]).toHaveProperty('reservation_date');
          expect(list[0]).toHaveProperty('id');
        }
      });
  });
});