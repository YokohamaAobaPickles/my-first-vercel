/**
 * Filename: src/app/facilities/(admin)/edit/[id]/page.test.tsx
 * Version: V1.2.0
 * Update: 2026-03-05
 * Remarks: Facility 型 V1.1.0 に合わせて全項目の初期表示・更新・遷移検証を追加。
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

import EditFacilityPage from '@/app/facilities/(admin)/edit/[id]/page';
import { useRouter, useParams } from 'next/navigation';
import {
  getFacilityById,
  updateFacility,
  deleteFacility,
} from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers', () => ({
  getFacilityById: vi.fn(),
  updateFacility: vi.fn(),
  deleteFacility: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

describe('EditFacilityPage (施設編集)', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  };

  const mockId = 'facility-1';

  const mockFacility = {
    id: mockId,
    facility_name: 'テスト施設',
    address: '東京都新宿区',
    map_url: 'https://maps.example.com',
    facility_notes: 'インドア2面',
    registration_group_id: null,
    phone: '03-1234-5678',
    email: 'info@example.com',
    facility_url: 'https://facility.example.jp',
    facility_fee_desc: '1時間2000円',
    court_numbers: '2',
    lottery_date_desc: '毎月1日',
    registration_date: '2026-01-15',
    renewal_date: '2027-03-31',
    registration_fee: 5000,
    annual_fee: 10000,
    parking_capacity: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useParams).mockReturnValue({ id: mockId });

    vi.mocked(getFacilityById).mockResolvedValue(mockFacility);
  });

  it('初期表示時に getFacilityById が呼ばれ、取得した全項目がフォームに表示される', async () => {
    render(<EditFacilityPage />);

    await waitFor(() => {
      expect(getFacilityById).toHaveBeenCalledWith(mockId);
    });

    expect(screen.getByDisplayValue('テスト施設')).toBeDefined();
    expect(screen.getByDisplayValue('東京都新宿区')).toBeDefined();
    expect(
      screen.getByDisplayValue('https://maps.example.com'),
    ).toBeDefined();
    expect(screen.getByDisplayValue('インドア2面')).toBeDefined();

    expect(screen.getByDisplayValue('03-1234-5678')).toBeDefined();
    expect(screen.getByDisplayValue('info@example.com')).toBeDefined();
    expect(
      screen.getByDisplayValue('https://facility.example.jp'),
    ).toBeDefined();
    expect(screen.getByDisplayValue('1時間2000円')).toBeDefined();
    expect(screen.getByDisplayValue('2')).toBeDefined();
    expect(screen.getByDisplayValue('毎月1日')).toBeDefined();
    expect(screen.getByDisplayValue('2026-01-15')).toBeDefined();
    expect(screen.getByDisplayValue('2027-03-31')).toBeDefined();
    expect(screen.getByDisplayValue('5000')).toBeDefined();
    expect(screen.getByDisplayValue('10000')).toBeDefined();
    expect(screen.getByDisplayValue('10')).toBeDefined();
  });

  it('更新ボタンクリックで updateFacility が最新型に基づく引数で呼ばれ、遷移する', async () => {
    vi.mocked(updateFacility).mockResolvedValue(mockFacility);

    render(<EditFacilityPage />);

    await screen.findByDisplayValue('テスト施設');

    fireEvent.change(screen.getByLabelText(/施設名/), {
      target: { value: '更新後施設' },
    });
    fireEvent.change(screen.getByLabelText(/住所/), {
      target: { value: '変更後住所' },
    });
    fireEvent.change(screen.getByLabelText(/Google Map URL/), {
      target: { value: 'https://maps.example.com/updated' },
    });
    fireEvent.change(screen.getByLabelText(/電話番号/), {
      target: { value: '03-9999-0000' },
    });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: 'updated@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/公式サイトURL/), {
      target: { value: 'https://updated.example.jp' },
    });
    fireEvent.change(screen.getByLabelText(/利用料金/), {
      target: { value: '2時間3000円' },
    });
    fireEvent.change(screen.getByLabelText(/コート番号/), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/抽選日/), {
      target: { value: '毎月15日' },
    });
    fireEvent.change(screen.getByLabelText(/団体登録日/), {
      target: { value: '2026-02-01' },
    });
    fireEvent.change(screen.getByLabelText(/団体更新期限/), {
      target: { value: '2027-06-30' },
    });
    fireEvent.change(screen.getByLabelText(/団体登録料/), {
      target: { value: '6000' },
    });
    fireEvent.change(screen.getByLabelText(/団体年会費/), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText(/駐車場台数/), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText(/備考/), {
      target: { value: '更新済みメモ' },
    });

    const updateButton = screen.getByRole('button', { name: /更新/ });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateFacility).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          facility_name: '更新後施設',
          address: '変更後住所',
          map_url: 'https://maps.example.com/updated',
          facility_notes: '更新済みメモ',
          phone: '03-9999-0000',
          email: 'updated@example.com',
          facility_url: 'https://updated.example.jp',
          facility_fee_desc: '2時間3000円',
          court_numbers: '3',
          lottery_date_desc: '毎月15日',
          registration_date: '2026-02-01',
          renewal_date: '2027-06-30',
          registration_fee: 6000,
          annual_fee: 12000,
          parking_capacity: 20,
        }),
      );
    });

    expect(mockRouter.push).toHaveBeenCalled();
    const pushedPath = mockRouter.push.mock.calls[0][0];
    expect(
      pushedPath === '/facilities' || pushedPath === `/facilities/${mockId}`,
    ).toBe(true);
  });

  it('削除ボタンで確認後に deleteFacility が呼ばれ一覧へ戻る', async () => {
    vi.mocked(deleteFacility).mockResolvedValue(true);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EditFacilityPage />);

    await screen.findByDisplayValue('テスト施設');

    const deleteButton = screen.getByRole('button', { name: /削除/ });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(deleteFacility).toHaveBeenCalledWith(mockId);
      expect(mockRouter.push).toHaveBeenCalledWith('/facilities');
    });

    confirmSpy.mockRestore();
  });

  it('APIエラー時に適切な処理が行われる（ここではフォームが表示されない）', async () => {
    vi.mocked(getFacilityById).mockResolvedValue(null);

    render(<EditFacilityPage />);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('テスト施設')).toBeNull();
    });
  });
});
