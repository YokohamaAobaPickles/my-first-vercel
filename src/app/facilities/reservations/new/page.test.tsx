/**
 * Filename: src/app/facilities/reservations/new/page.test.tsx
 * Version: V1.2.0
 * Update: 2026-03-13
 * Remarks: 
 * V1.2.0 - キャンセルボタンの遷移テストを追加。
 * V1.1.0 - 施設選択、予約団体等の追加項目に対応。
 * V1.0.0 - F-21 施設予約情報の登録のテスト。
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

import NewReservationPage from '@/app/facilities/reservations/new/page';
import { useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

// モック化
vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewReservationPage (施設予約新規登録 F-21)', () => {
  const mockPush = vi.fn();
  const mockFacilities = [
    { id: 'fac-1', facility_name: '青葉テニスコート' }
  ];
  const mockGroups = [
    { id: 'grp-1', registration_club_name: '青葉ピックルズ' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);

    // マスターデータ取得のモック設定
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);
    vi.mocked(facilityHelpers.getRegistrationGroups).mockResolvedValue(mockGroups as any);
  });

  it('全入力フィールドが存在し、マスターデータが選択肢に反映される', async () => {
    render(<NewReservationPage />);

    // マスター読み込み待ち (page.tsx の文言に合わせる)
    await waitFor(() => {
      expect(screen.queryByText(/読み込み中/)).not.toBeInTheDocument();
    });

    // 各フィールドの存在確認
    expect(screen.getByLabelText(/施設名 \(必須\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/予約団体/)).toBeInTheDocument();
    expect(screen.getByLabelText(/予約日/)).toBeInTheDocument();
    expect(screen.getByLabelText(/時間枠/)).toBeInTheDocument();
    expect(screen.getByLabelText(/コート数/)).toBeInTheDocument();
    expect(screen.getByLabelText(/費用/)).toBeInTheDocument();
    expect(screen.getByLabelText(/予約番号/)).toBeInTheDocument();
    expect(screen.getByLabelText(/当落情報/)).toBeInTheDocument();
    expect(screen.getByLabelText(/予約メモ/)).toBeInTheDocument();

    // セレクトボックスの選択肢にデータが反映されているか確認
    // (option内のテキストを確認)
    expect(screen.getByText(/青葉テニスコート/)).toBeInTheDocument();
    expect(screen.getByText(/青葉ピックルズ/)).toBeInTheDocument();
  });

  it('値を入力して「保存する」をクリックすると、正しいペイロードで createReservation が呼ばれる', async () => {
    vi.mocked(facilityHelpers.createReservation).mockResolvedValue({ id: 'new-res-id' } as any);

    render(<NewReservationPage />);

    await waitFor(() => expect(screen.queryByText(/読み込み中/)).not.toBeInTheDocument());

    // 入力操作
    fireEvent.change(screen.getByLabelText(/施設名 \(必須\)/), { target: { value: 'fac-1' } });
    fireEvent.change(screen.getByLabelText(/予約団体/), { target: { value: 'grp-1' } });
    fireEvent.change(screen.getByLabelText(/予約日/), { target: { value: '2026-05-15' } });
    fireEvent.change(screen.getByLabelText(/時間枠/), { target: { value: '13:00-15:00' } });
    fireEvent.change(screen.getByLabelText(/コート数/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/費用/), { target: { value: '4000' } });
    fireEvent.change(screen.getByLabelText(/予約番号/), { target: { value: 'RES-001' } });
    fireEvent.change(screen.getByLabelText(/当落情報/), { target: { value: '当選' } });
    fireEvent.change(screen.getByLabelText(/予約メモ/), { target: { value: 'テストメモ' } });

    // 保存ボタンクリック
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(facilityHelpers.createReservation).toHaveBeenCalledWith(expect.objectContaining({
        facility_id: 'fac-1',
        registration_group_id: 'grp-1',
        reservation_date: '2026-05-15',
        reservation_time_slot: '13:00-15:00',
        reserved_courts: 2,
        reserved_fee: 4000,
        reservation_number: 'RES-001',
        lottery_results: '当選',
        reservation_notes: 'テストメモ',
      }));
    });

    // 保存成功後に一覧へ遷移することを確認
    expect(mockPush).toHaveBeenCalledWith('/facilities/reservations');
  });

  it('施設未選択の場合、アラートを表示し保存処理を行わない', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<NewReservationPage />);

    await waitFor(() => expect(screen.queryByText(/読み込み中/)).not.toBeInTheDocument());

    // 施設を選ばずに保存
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    expect(alertSpy).toHaveBeenCalledWith('施設を選択してください');
    expect(facilityHelpers.createReservation).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('キャンセルボタンをクリックしたとき、APIを呼ばずに一覧画面へ遷移する', async () => {
    render(<NewReservationPage />);

    await waitFor(() => expect(screen.queryByText(/読み込み中/)).not.toBeInTheDocument());

    // キャンセルボタン（Linkコンポーネント）を取得
    const cancelButton = screen.getByRole('link', { name: /キャンセル/ });
    
    // href属性が正しいことを確認
    expect(cancelButton).toHaveAttribute('href', '/facilities/reservations');

    // 保存処理が呼ばれていないことを確認
    expect(facilityHelpers.createReservation).not.toHaveBeenCalled();
  });
});