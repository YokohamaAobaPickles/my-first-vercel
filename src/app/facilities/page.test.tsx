/**
 * Filename: src/app/facilities/page.test.tsx
 * Version: V1.1.2
 * Update: 2026-03-05
 * V1.1.2
 * - 表示項目を「施設名」と「電話番号」に絞ったテストに更新
 * V1.1.1
 * - 詳細ボタンの削除に伴い、施設名リンクのみを検証するようテストを修正
 * V1.1.0
 * - 一覧画面のシンプル化と詳細リンク追加のためのテスト
 * V1.0.0
 * - 施設一覧画面の基本的な表示と新規登録リンクのテスト
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import FacilitiesPage from './page';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/utils/facilityHelpers');

const mockFacilities = [
  {
    id: 'facility-1',
    facility_name: 'テスト施設',
    address: '東京都新宿区',
    phone: '03-1234-5678',
    map_url: 'https://maps.example.com',
    facility_notes: 'インドア2面',
    registration_group_id: null,
  },
];

describe('FacilitiesPage (施設一覧)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('施設がない場合にメッセージを表示する', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue([]);

    const ui = await FacilitiesPage();
    render(ui);

    expect(screen.getByText(/施設が登録されていません/)).toBeDefined();
  });

  it('施設名と電話番号が表示されている', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(
      mockFacilities as any
    );

    const ui = await FacilitiesPage();
    render(ui);

    expect(await screen.findByText('テスト施設')).toBeInTheDocument();
    expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
  });

  it('施設名が /facilities/[id] へのリンクになっている', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(
      mockFacilities as any
    );

    const ui = await FacilitiesPage();
    render(ui);

    const nameLink = await screen.findByRole('link', {
      name: 'テスト施設',
    });
    expect(nameLink).toHaveAttribute('href', '/facilities/facility-1');
  });

  it('一覧画面上に地図URL・備考のテキストが表示されない', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(
      mockFacilities as any
    );

    const ui = await FacilitiesPage();
    render(ui);

    // 以前表示されていた項目が存在しないことを確認
    expect(screen.queryByText('https://maps.example.com')).toBeNull();
    expect(screen.queryByText('インドア2面')).toBeNull();
  });
});