/**
 * Filename: src/app/facilities/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-03-04
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

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

describe('FacilitiesPage (施設一覧)', () => {
  it('施設がない場合にメッセージを表示する', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue([]);

    const ui = await FacilitiesPage();
    render(ui);

    expect(
      screen.getByText('施設が登録されていません')
    ).toBeInTheDocument();
  });

  it('施設がある場合に施設名を表示する', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue([
      {
        id: 'facility-1',
        facility_name: 'テスト施設',
      } as any,
    ]);

    const ui = await FacilitiesPage();
    render(ui);

    expect(
      await screen.findByText('テスト施設')
    ).toBeInTheDocument();
  });

  it('新規登録リンクの href が正しい', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue([]);

    const ui = await FacilitiesPage();
    render(ui);

    const link = await screen.findByRole('link', {
      name: '新規登録',
    });

    expect(link).toHaveAttribute('href', '/facilities/new');
  });
});

