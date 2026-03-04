/**
 * Filename: src/app/facilities/new/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-03-04
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

import NewFacilityPage from './page';
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
        }),
      );
      expect(mockPush).toHaveBeenCalledWith('/facilities');
    });
  });
});

