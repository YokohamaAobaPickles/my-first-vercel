/**
 * Filename: src/app/facilities/edit/[id]/page.test.tsx
 * Version : V1.0.2
 * Update  : 2026-03-05
 * Remarks : TypeScriptの型不整合（registration_group_idの欠落）を修正。
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

import EditFacilityPage from './page';
import { useRouter, useParams } from 'next/navigation';
import {
  getFacilityById,
  updateFacility,
  deleteFacility,
} from '@/utils/facilityHelpers';

// モックの定義：外部変数を使わず内部で vi.fn() を定義
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

  // TypeScriptのエラー回避のため、registration_group_id を追加
  const mockFacility = {
    id: mockId,
    facility_name: 'テスト施設',
    address: '東京都新宿区',
    map_url: 'https://maps.example.com',
    facility_notes: 'インドア2面',
    registration_group_id: null, // ← ここを追加
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useParams).mockReturnValue({ id: mockId });

    // モックの戻り値を設定
    vi.mocked(getFacilityById).mockResolvedValue(mockFacility);
  });

  it('初期表示時に施設情報を取得してフォームに表示する', async () => {
    render(<EditFacilityPage />);

    await waitFor(() => {
      expect(getFacilityById).toHaveBeenCalledWith(mockId);
    });

    expect(screen.getByDisplayValue('テスト施設')).toBeDefined();
    expect(screen.getByDisplayValue('東京都新宿区')).toBeDefined();
    expect(screen.getByDisplayValue('https://maps.example.com')).toBeDefined();
    expect(screen.getByDisplayValue('インドア2面')).toBeDefined();
  });

  it('更新ボタンクリックで updateFacility が呼ばれ一覧へ遷移する', async () => {
    vi.mocked(updateFacility).mockResolvedValue(mockFacility);

    render(<EditFacilityPage />);

    const nameInput = await screen.findByDisplayValue('テスト施設');
    fireEvent.change(nameInput, { target: { value: '更新後施設' } });

    const addressInput = screen.getByDisplayValue('東京都新宿区');
    fireEvent.change(addressInput, { target: { value: '変更後住所' } });

    const mapInput = screen.getByDisplayValue('https://maps.example.com');
    fireEvent.change(mapInput, {
      target: { value: 'https://maps.example.com/updated' },
    });

    const notesInput = screen.getByDisplayValue('インドア2面');
    fireEvent.change(notesInput, { target: { value: '更新済みメモ' } });

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
        }),
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/facilities');
    });
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