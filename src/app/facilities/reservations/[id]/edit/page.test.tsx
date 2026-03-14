/**
 * Filename: src/app/facilities/reservations/[id]/edit/page.test.tsx
 * Version: V1.1.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.1.0 - 施設名、予約団体、予約者名の編集に対応。F-22 施設予約情報の更新テストを強化。
 * V1.0.0 - F-22 施設予約情報の更新をテスト。
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import EditReservationPage from '@/app/facilities/reservations/[id]/edit/page';
import { useRouter, useParams } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

// モック化
vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

const mockId = 'res-1';

const mockReservation = {
  id: mockId,
  facility_id: 'fac-1',
  registration_group_id: 'grp-1',
  reservation_number: 'RES-001',
  reservation_date: '2026-05-15',
  reservation_time_slot: '13:00-15:00',
  reserved_courts: 2,
  reserved_fee: 4000,
  reservation_limit: '2026-05-20',
  reserver_name: '元々の担当者',
  lottery_results: '当選',
  reservation_notes: '予約メモです',
};

const mockFacilities = [
  { id: 'fac-1', facility_name: '青葉テニスコート' },
  { id: 'fac-2', facility_name: '中央テニスコート' }
];

const mockGroups = [
  { id: 'grp-1', registration_club_name: '青葉ピックルズ' },
  { id: 'grp-2', registration_club_name: '中央クラブ' }
];

describe('EditReservationPage (施設予約編集 F-22)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    
    // マスターデータと予約データのモック設定
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);
    vi.mocked(facilityHelpers.getRegistrationGroups).mockResolvedValue(mockGroups as any);
    vi.mocked(facilityHelpers.getReservationById).mockResolvedValue(
      mockReservation as any,
    );
  });

  it('初期値が正しくセットされ、マスターデータが選択肢として表示される', async () => {
    render(<EditReservationPage />);

    // 読み込み完了待ち
    await waitFor(() => {
      expect(facilityHelpers.getReservationById).toHaveBeenCalledWith(mockId);
    });

    // 既存データの確認
    expect(screen.getByLabelText(/施設名/)).toHaveValue('fac-1');
    expect(screen.getByLabelText(/予約団体/)).toHaveValue('grp-1');
    expect(screen.getByLabelText(/予約日/)).toHaveValue('2026-05-15');
    expect(screen.getByLabelText(/予約者名/)).toHaveValue('元々の担当者');

    // セレクトボックスの選択肢確認
    expect(screen.getByText('中央テニスコート')).toBeInTheDocument();
    expect(screen.getByText('中央クラブ')).toBeInTheDocument();
  });

  it('値を変更して「保存する」をクリックすると updateReservation が呼ばれる', async () => {
    vi.mocked(facilityHelpers.updateReservation).mockResolvedValue({
      ...mockReservation,
      reservation_date: '2026-06-01',
    } as any);

    render(<EditReservationPage />);

    // 初期データロード待ち
    await waitFor(() => expect(screen.getByDisplayValue('2026-05-15')).toBeInTheDocument());

    // 各項目の変更
    fireEvent.change(screen.getByLabelText(/施設名/), { target: { value: 'fac-2' } });
    fireEvent.change(screen.getByLabelText(/予約団体/), { target: { value: 'grp-2' } });
    fireEvent.change(screen.getByLabelText(/予約日/), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText(/時間枠/), { target: { value: '10:00-12:00' } });
    fireEvent.change(screen.getByLabelText(/予約者名/), { target: { value: '鈴木 一郎' } });
    fireEvent.change(screen.getByLabelText(/費用/), { target: { value: '6000' } });
    fireEvent.change(screen.getByLabelText(/支払い期限/), { target: { value: '2026-06-05' } });

    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(facilityHelpers.updateReservation).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          facility_id: 'fac-2',
          registration_group_id: 'grp-2',
          reservation_date: '2026-06-01',
          reservation_time_slot: '10:00-12:00',
          reserver_name: '鈴木 一郎',
          reserved_fee: 6000,
          reservation_limit: '2026-06-05',
        }),
      );
    });
    
    // 成功後に詳細画面へ戻ることを確認
    expect(mockPush).toHaveBeenCalledWith(`/facilities/reservations/${mockId}`);
  });

  it('キャンセルボタンをクリックしたとき、更新せずに詳細画面へ戻る', async () => {
    render(<EditReservationPage />);

    await waitFor(() => expect(screen.getByDisplayValue('2026-05-15')).toBeInTheDocument());

    const cancelButton = screen.getByRole('link', { name: /キャンセル/ });
    expect(cancelButton).toHaveAttribute('href', `/facilities/reservations/${mockId}`);

    expect(facilityHelpers.updateReservation).not.toHaveBeenCalled();
  });
});