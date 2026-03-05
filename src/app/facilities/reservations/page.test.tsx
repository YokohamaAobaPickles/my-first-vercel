/**
 * Filename: src/app/facilities/reservations/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-24 施設予約情報一覧参照のテスト。getReservations をモック。
 */

import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import ReservationsPage from './page';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

const mockReservations = [
  {
    id: 'res-1',
    facility_id: 'fac-1',
    registration_group_id: 'grp-1',
    reservation_number: null,
    reservation_date: '2026-05-01',
    reservation_time_slot: '13:00-15:00',
    reserved_courts: 2,
    reserved_fee: 4000,
    reservation_limit: null,
    reserver_name: null,
    lottery_results: null,
    reservation_notes: null,
  },
  {
    id: 'res-2',
    facility_id: 'fac-1',
    registration_group_id: null,
    reservation_number: null,
    reservation_date: '2026-05-02',
    reservation_time_slot: '10:00-12:00',
    reserved_courts: 1,
    reserved_fee: 2000,
    reservation_limit: null,
    reserver_name: null,
    lottery_results: null,
    reservation_notes: null,
  },
];

describe('ReservationsPage (施設予約一覧 F-24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('予約データがない場合に「予約情報がありません」と表示される', async () => {
    vi.mocked(facilityHelpers.getReservations).mockResolvedValue([]);

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservations,
      ).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/予約情報がありません/),
    ).toBeInTheDocument();
  });

  it('予約データがある場合、予約日・時間枠・コート数が表示される', async () => {
    vi.mocked(facilityHelpers.getReservations).mockResolvedValue(
      mockReservations as any,
    );

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservations,
      ).toHaveBeenCalled();
    });

    expect(screen.getByText('2026-05-01')).toBeInTheDocument();
    expect(screen.getByText('2026-05-02')).toBeInTheDocument();
    expect(screen.getByText('13:00-15:00')).toBeInTheDocument();
    expect(screen.getByText('10:00-12:00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('各予約項目に詳細画面 /facilities/reservations/[id] へのリンクが存在する', async () => {
    vi.mocked(facilityHelpers.getReservations).mockResolvedValue(
      mockReservations as any,
    );

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservations,
      ).toHaveBeenCalled();
    });

    const links = screen.getAllByRole('link');
    const hrefs = links.map((el) => el.getAttribute('href'));

    expect(hrefs).toContain('/facilities/reservations/res-1');
    expect(hrefs).toContain('/facilities/reservations/res-2');
  });
});
