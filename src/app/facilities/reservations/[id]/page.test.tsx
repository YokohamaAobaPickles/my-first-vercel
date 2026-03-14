/**
 * Filename: src/app/facilities/reservations/[id]/page.test.tsx
 * Version: V1.1.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.1.0 - 施設名、予約団体名などの表示確認テストを追加。F-25 詳細参照を強化。
 * V1.0.1 - F-25 施設予約詳細参照・F-23 施設予約削除のテスト。
 */

import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import ReservationDetailPage from '@/app/facilities/reservations/[id]/page';
import { useParams, useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

// モック化
vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

// Linkコンポーネントを単純なaタグとして扱うためのモック
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

const mockId = 'res-1';

// 施設情報と団体情報を含む完全な予約データのモック
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
  reserver_name: '予約担当者',
  lottery_results: '当選',
  reservation_notes: '予約メモです',
  // 外部結合で取得される想定の名称データ
  facilities: { facility_name: '青葉テニスコート' },
  registration_groups: { registration_club_name: '青葉ピックルズ' }
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

  it('予約IDに基づき全項目が表示されること（施設名、団体名含む）', async () => {
    render(<ReservationDetailPage />);

    // APIが呼ばれるのを待つ
    await waitFor(() => {
      expect(facilityHelpers.getReservationById).toHaveBeenCalledWith(mockId);
    });

    // 施設名・団体名の表示（これらが抜けていた重要な情報です）
    expect(screen.getByText('青葉テニスコート')).toBeInTheDocument();
    expect(screen.getByText('青葉ピックルズ')).toBeInTheDocument();

    // 基本情報の表示
    expect(screen.getByText('2026-05-15')).toBeInTheDocument();
    expect(screen.getByText('13:00-15:00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('RES-001')).toBeInTheDocument();
    expect(screen.getByText('4000')).toBeInTheDocument();
    expect(screen.getByText('2026-05-20')).toBeInTheDocument();
    expect(screen.getByText('予約担当者')).toBeInTheDocument();
    expect(screen.getByText('当選')).toBeInTheDocument();
    expect(screen.getByText('予約メモです')).toBeInTheDocument();
  });

  it('「一覧へ戻る」ボタンが正しいパスへのリンクであること', async () => {
    render(<ReservationDetailPage />);
    await waitFor(() => expect(facilityHelpers.getReservationById).toHaveBeenCalled());

    const backLink = screen.getByRole('link', { name: /一覧へ戻る/ });
    expect(backLink).toHaveAttribute('href', '/facilities/reservations');
  });

  it('「編集する」ボタンが正しい編集画面へのリンクであること', async () => {
    render(<ReservationDetailPage />);
    await waitFor(() => expect(facilityHelpers.getReservationById).toHaveBeenCalled());

    const editLink = screen.getByRole('link', { name: /編集する/ });
    expect(editLink).toHaveAttribute('href', `/facilities/reservations/${mockId}/edit`);
  });

  it('削除ボタン押下時、確認後に削除が実行され、一覧に遷移すること', async () => {
    vi.mocked(facilityHelpers.deleteReservation).mockResolvedValue(true);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ReservationDetailPage />);
    await waitFor(() => expect(facilityHelpers.getReservationById).toHaveBeenCalled());

    const deleteButton = screen.getByRole('button', { name: /削除する/ });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(facilityHelpers.deleteReservation).toHaveBeenCalledWith(mockId);
      expect(mockPush).toHaveBeenCalledWith('/facilities/reservations');
    });

    confirmSpy.mockRestore();
  });
});