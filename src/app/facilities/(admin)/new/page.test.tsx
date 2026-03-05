/**
 * Filename: src/app/facilities/(admin)/new/page.test.tsx
 * Version: V1.2.0
 * Update: 2026-03-05
 * Remarks: Facility 型拡張に合わせてフォーム項目・createFacility 検証を追加。
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

import NewFacilityPage from '@/app/facilities/(admin)/new/page';
import { useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewFacilityPage (施設新規登録)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('フォームの各項目に入力できること', () => {
    render(<NewFacilityPage />);

    const nameInput = screen.getByLabelText(/施設名/);
    const addressInput = screen.getByLabelText(/住所/);
    const notesInput = screen.getByLabelText(/備考/);

    fireEvent.change(nameInput, {
      target: { value: 'テスト施設' },
    });
    fireEvent.change(addressInput, {
      target: { value: '東京都新宿区' },
    });
    fireEvent.change(notesInput, {
      target: { value: 'インドア2面' },
    });

    expect(
      (nameInput as HTMLInputElement).value
    ).toBe('テスト施設');
    expect(
      (addressInput as HTMLInputElement).value
    ).toBe('東京都新宿区');
    expect(
      (notesInput as HTMLInputElement).value
    ).toBe('インドア2面');

    const phoneInput = screen.getByLabelText(/電話番号/);
    const emailInput = screen.getByLabelText(/メールアドレス/);
    const siteInput = screen.getByLabelText(/公式サイトURL/);
    const feeInput = screen.getByLabelText(/利用料金/);
    const courtInput = screen.getByLabelText(/コート番号/);
    const lotteryInput = screen.getByLabelText(/抽選日/);
    const regDateInput = screen.getByLabelText(/団体登録日/);
    const renewalInput = screen.getByLabelText(/団体更新期限/);
    const regFeeInput = screen.getByLabelText(/団体登録料/);
    const annualInput = screen.getByLabelText(/団体年会費/);
    const parkingInput = screen.getByLabelText(/駐車場台数/);

    fireEvent.change(phoneInput, { target: { value: '03-1234-5678' } });
    fireEvent.change(emailInput, { target: { value: 'info@example.com' } });
    fireEvent.change(siteInput, {
      target: { value: 'https://facility.example.jp' },
    });
    fireEvent.change(feeInput, { target: { value: '1時間2000円' } });
    fireEvent.change(courtInput, { target: { value: '2' } });
    fireEvent.change(lotteryInput, { target: { value: '毎月1日' } });
    fireEvent.change(regDateInput, { target: { value: '2026-01-15' } });
    fireEvent.change(renewalInput, { target: { value: '2027-03-31' } });
    fireEvent.change(regFeeInput, { target: { value: '5000' } });
    fireEvent.change(annualInput, { target: { value: '10000' } });
    fireEvent.change(parkingInput, { target: { value: '10' } });

    expect((phoneInput as HTMLInputElement).value).toBe('03-1234-5678');
    expect((emailInput as HTMLInputElement).value).toBe('info@example.com');
    expect((siteInput as HTMLInputElement).value)
      .toBe('https://facility.example.jp');
    expect((feeInput as HTMLInputElement).value).toBe('1時間2000円');
    expect((courtInput as HTMLInputElement).value).toBe('2');
    expect((lotteryInput as HTMLInputElement).value).toBe('毎月1日');
    expect((regDateInput as HTMLInputElement).value).toBe('2026-01-15');
    expect((renewalInput as HTMLInputElement).value).toBe('2027-03-31');
    expect((regFeeInput as HTMLInputElement).value).toBe('5000');
    expect((annualInput as HTMLInputElement).value).toBe('10000');
    expect((parkingInput as HTMLInputElement).value).toBe('10');
  });

  it('Google Map URL フィールドに入力できること', () => {
    render(<NewFacilityPage />);

    const mapInput = screen.getByLabelText(/Google Map URL/);

    fireEvent.change(mapInput, {
      target: { value: 'https://maps.example.com' },
    });

    expect(
      (mapInput as HTMLInputElement).value
    ).toBe('https://maps.example.com');
  });

  it('登録ボタン押下で createFacility が正しい引数で呼ばれる', 
    async () => {
    vi.mocked(facilityHelpers.createFacility).mockResolvedValue({
      id: 'facility-1',
    } as any);

    render(<NewFacilityPage />);

    fireEvent.change(screen.getByLabelText(/施設名/), {
      target: { value: 'テスト施設' },
    });
    fireEvent.change(screen.getByLabelText(/住所/), {
      target: { value: '東京都新宿区' },
    });
    fireEvent.change(screen.getByLabelText(/備考/), {
      target: { value: 'インドア2面' },
    });
    fireEvent.change(
      screen.getByLabelText(/Google Map URL/),
      {
        target: { value: 'https://maps.example.com' },
      },
    );
    fireEvent.change(screen.getByLabelText(/電話番号/), {
      target: { value: '03-1234-5678' },
    });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: 'info@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/公式サイトURL/), {
      target: { value: 'https://facility.example.jp' },
    });
    fireEvent.change(screen.getByLabelText(/利用料金/), {
      target: { value: '1時間2000円' },
    });
    fireEvent.change(screen.getByLabelText(/コート番号/), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/抽選日/), {
      target: { value: '毎月1日' },
    });
    fireEvent.change(screen.getByLabelText(/団体登録日/), {
      target: { value: '2026-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/団体更新期限/), {
      target: { value: '2027-03-31' },
    });
    fireEvent.change(screen.getByLabelText(/団体登録料/), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/団体年会費/), {
      target: { value: '10000' },
    });
    fireEvent.change(screen.getByLabelText(/駐車場台数/), {
      target: { value: '10' },
    });

    const submitButton = screen.getByRole('button', {
      name: /登録/,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        facilityHelpers.createFacility
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          facility_name: 'テスト施設',
          address: '東京都新宿区',
          facility_notes: 'インドア2面',
          map_url: 'https://maps.example.com',
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
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/facilities');
    });
  });
});
