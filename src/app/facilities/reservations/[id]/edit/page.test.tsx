/**
 * Filename: src/app/facilities/reservations/[id]/edit/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-22 施設予約情報の更新をテスト。getReservationById / updateReservation をモック。
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

import EditReservationPage from './page';
import { useRouter, useParams } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

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
  reserver_name: null,
  lottery_results: '当選',
  reservation_notes: '予約メモです',
};

describe('EditReservationPage (施設予約編集 F-22)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    vi.mocked(facilityHelpers.getReservationById).mockResolvedValue(
      mockReservation as any,
    );
  });

  it('getReservationById で取得した既存データが入力フィールドの初期値としてセットされている', async () => {
    render(<EditReservationPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(
      screen.getByDisplayValue('2026-05-15'),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('13:00-15:00'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4000')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('RES-001'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('当選')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('予約メモです'),
    ).toBeInTheDocument();
  });

  it('値を変更して「保存する」をクリックすると updateReservation が変更後の値で呼ばれる', async () => {
    vi.mocked(facilityHelpers.updateReservation).mockResolvedValue({
      ...mockReservation,
      reservation_date: '2026-06-01',
    } as any);

    render(<EditReservationPage />);

    await screen.findByDisplayValue('2026-05-15');

    fireEvent.change(screen.getByLabelText(/^予約日$/), {
      target: { value: '2026-06-01' },
    });
    fireEvent.change(screen.getByLabelText(/^時間枠$/), {
      target: { value: '10:00-12:00' },
    });
    fireEvent.change(screen.getByLabelText(/^コート数$/), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/^費用$/), {
      target: { value: '6000' },
    });
    fireEvent.change(screen.getByLabelText(/^予約番号$/), {
      target: { value: 'RES-002' },
    });
    fireEvent.change(screen.getByLabelText(/^当落情報$/), {
      target: { value: '落選' },
    });
    fireEvent.change(screen.getByLabelText(/^予約メモ$/), {
      target: { value: '更新後のメモ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(
        facilityHelpers.updateReservation,
      ).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          reservation_date: '2026-06-01',
          reservation_time_slot: '10:00-12:00',
          reserved_courts: 3,
          reserved_fee: 6000,
          reservation_number: 'RES-002',
          lottery_results: '落選',
          reservation_notes: '更新後のメモ',
        }),
      );
    });
  });

  it('保存成功後、詳細画面 /facilities/reservations/[id] へ遷移する', async () => {
    vi.mocked(facilityHelpers.updateReservation).mockResolvedValue(
      mockReservation as any,
    );

    render(<EditReservationPage />);

    await screen.findByDisplayValue('2026-05-15');

    fireEvent.change(screen.getByLabelText(/^予約日$/), {
      target: { value: '2026-05-20' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/facilities/reservations/res-1',
      );
    });
  });
});
