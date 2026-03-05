/**
 * Filename: src/app/facilities/reservations/new/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-21 施設予約情報の登録のテスト。createReservation をモック。
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

import NewReservationPage from './page';
import { useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewReservationPage (施設予約新規登録 F-21)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('予約日・時間枠・コート数・費用・予約番号・当落情報の入力フィールドと「保存する」ボタンが存在し、値を入力できる', () => {
    render(<NewReservationPage />);

    const dateInput = screen.getByLabelText(/^予約日$/);
    const slotInput = screen.getByLabelText(/^時間枠$/);
    const courtsInput = screen.getByLabelText(/^コート数$/);
    const feeInput = screen.getByLabelText(/^費用$/);
    const numberInput = screen.getByLabelText(/^予約番号$/);
    const lotteryInput = screen.getByLabelText(/^当落情報$/);

    expect(dateInput).toBeInTheDocument();
    expect(slotInput).toBeInTheDocument();
    expect(courtsInput).toBeInTheDocument();
    expect(feeInput).toBeInTheDocument();
    expect(numberInput).toBeInTheDocument();
    expect(lotteryInput).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /保存する/ }),
    ).toBeInTheDocument();

    fireEvent.change(dateInput, { target: { value: '2026-05-15' } });
    fireEvent.change(slotInput, { target: { value: '13:00-15:00' } });
    fireEvent.change(courtsInput, { target: { value: '2' } });
    fireEvent.change(feeInput, { target: { value: '4000' } });
    fireEvent.change(numberInput, { target: { value: 'RES-001' } });
    fireEvent.change(lotteryInput, { target: { value: '当選' } });

    expect((dateInput as HTMLInputElement).value).toBe('2026-05-15');
    expect((slotInput as HTMLInputElement).value).toBe('13:00-15:00');
    expect((courtsInput as HTMLInputElement).value).toBe('2');
    expect((feeInput as HTMLInputElement).value).toBe('4000');
    expect((numberInput as HTMLInputElement).value).toBe('RES-001');
    expect((lotteryInput as HTMLInputElement).value).toBe('当選');
  });

  it('「保存する」クリックで createReservation が入力値を持って呼ばれる', async () => {
    vi.mocked(facilityHelpers.createReservation).mockResolvedValue({
      id: 'res-1',
      facility_id: 'fac-1',
      registration_group_id: null,
      reservation_number: 'RES-001',
      reservation_date: '2026-05-15',
      reservation_time_slot: '13:00-15:00',
      reserved_courts: 2,
      reserved_fee: 4000,
      reservation_limit: null,
      reserver_name: null,
      lottery_results: '当選',
      reservation_notes: null,
    } as any);

    render(<NewReservationPage />);

    fireEvent.change(screen.getByLabelText(/^予約日$/), {
      target: { value: '2026-05-15' },
    });
    fireEvent.change(screen.getByLabelText(/^時間枠$/), {
      target: { value: '13:00-15:00' },
    });
    fireEvent.change(screen.getByLabelText(/^コート数$/), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/^費用$/), {
      target: { value: '4000' },
    });
    fireEvent.change(screen.getByLabelText(/^予約番号$/), {
      target: { value: 'RES-001' },
    });
    fireEvent.change(screen.getByLabelText(/^当落情報$/), {
      target: { value: '当選' },
    });

    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(
        facilityHelpers.createReservation,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          reservation_date: '2026-05-15',
          reservation_time_slot: '13:00-15:00',
          reserved_courts: 2,
          reserved_fee: 4000,
          reservation_number: 'RES-001',
          lottery_results: '当選',
        }),
      );
    });
  });

  it('保存成功後、router.push(\'/facilities/reservations\') が呼ばれる', async () => {
    vi.mocked(facilityHelpers.createReservation).mockResolvedValue({
      id: 'res-1',
      facility_id: 'fac-1',
      registration_group_id: null,
      reservation_number: null,
      reservation_date: '2026-05-15',
      reservation_time_slot: '13:00-15:00',
      reserved_courts: 2,
      reserved_fee: 4000,
      reservation_limit: null,
      reserver_name: null,
      lottery_results: null,
      reservation_notes: null,
    } as any);

    render(<NewReservationPage />);

    fireEvent.change(screen.getByLabelText(/^予約日$/), {
      target: { value: '2026-05-15' },
    });
    fireEvent.change(screen.getByLabelText(/^コート数$/), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/facilities/reservations',
      );
    });
  });
});
