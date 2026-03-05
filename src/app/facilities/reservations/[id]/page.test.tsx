/**
 * Filename: src/app/facilities/reservations/[id]/page.test.tsx
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks: F-25 施設予約詳細参照・F-23 施設予約削除のテスト。
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

import ReservationDetailPage from './page';
import { useParams, useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
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

describe('ReservationDetailPage (施設予約詳細 F-25 / F-23)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
    vi.mocked(facilityHelpers.getReservationById).mockResolvedValue(
      mockReservation as any,
    );
  });

  it('useParams の id で getReservationById が呼ばれ、予約日・時間枠・コート数・予約番号・費用・支払い期限・当落情報・予約メモが表示される', async () => {
    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(screen.getByText('2026-05-15')).toBeInTheDocument();
    expect(screen.getByText('13:00-15:00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('RES-001')).toBeInTheDocument();
    expect(screen.getByText('4000')).toBeInTheDocument();
    expect(screen.getByText('2026-05-20')).toBeInTheDocument();
    expect(screen.getByText('当選')).toBeInTheDocument();
    expect(screen.getByText('予約メモです')).toBeInTheDocument();
  });

  it('「編集する」が /facilities/reservations/[id]/edit へのリンクである', async () => {
    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    const editLink = screen.getByRole('link', { name: /編集する/ });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      'href',
      '/facilities/reservations/res-1/edit',
    );
  });

  it('「一覧へ戻る」が /facilities/reservations へのリンクである', async () => {
    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    const backLink = screen.getByRole('link', { name: /一覧へ戻る/ });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute(
      'href',
      '/facilities/reservations',
    );
  });

  it('「削除する」ボタンが表示されている', async () => {
    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(
      screen.getByRole('button', { name: /削除する/ }),
    ).toBeInTheDocument();
  });

  it('「削除する」押下で confirm を表示し、OK で deleteReservation(id) を呼び、成功後に一覧へ戻る', async () => {
    vi.mocked(facilityHelpers.deleteReservation).mockResolvedValue(
      true,
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getReservationById,
      ).toHaveBeenCalledWith(mockId);
    });

    const deleteButton = screen.getByRole('button', { name: /削除する/ });
    deleteButton.click();

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        facilityHelpers.deleteReservation,
      ).toHaveBeenCalledWith(mockId);
      expect(mockPush).toHaveBeenCalledWith(
        '/facilities/reservations',
      );
    });

    confirmSpy.mockRestore();
  });
});
