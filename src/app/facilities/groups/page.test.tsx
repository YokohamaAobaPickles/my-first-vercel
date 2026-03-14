/**
 * Filename: src/app/facilities/groups/page.test.tsx
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks:
 * V1.0.1
 * - 代表者IDというテキストを持つ要素が1つ以上あることを検証するよう修正 
 * V1.0.0
 * F-04 登録団体一覧参照のテスト。getRegistrationGroups をモック。
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

import GroupsPage from '@/app/facilities/groups/page';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

const mockGroups = [
  {
    id: 'grp-1',
    registration_club_name: 'テスト団体A',
    registration_club_number: 'G-001',
    representative_id: 'mem-1',
    vice_representative_id: null,
    registration_club_notes: null,
  },
  {
    id: 'grp-2',
    registration_club_name: 'テスト団体B',
    registration_club_number: 'G-002',
    representative_id: null,
    vice_representative_id: null,
    registration_club_notes: null,
  },
];

describe('GroupsPage (登録団体一覧 F-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('団体が登録されていない場合に「登録団体がありません」と表示される', async () => {
    vi.mocked(facilityHelpers.getRegistrationGroups).mockResolvedValue([]);

    render(<GroupsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroups,
      ).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/登録団体がありません/),
    ).toBeInTheDocument();
  });

  it('団体リストがある場合、団体名・団体番号・代表者IDが正しくレンダリングされる', async () => {
    vi.mocked(facilityHelpers.getRegistrationGroups).mockResolvedValue(
      mockGroups as any,
    );

    render(<GroupsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroups,
      ).toHaveBeenCalled();
    });

    expect(screen.getByText('テスト団体A')).toBeInTheDocument();
    expect(screen.getByText('テスト団体B')).toBeInTheDocument();
    expect(screen.getByText('G-001')).toBeInTheDocument();
    expect(screen.getByText('G-002')).toBeInTheDocument();
    // 代表者IDというテキストを持つ要素が1つ以上あることを検証
    expect(screen.getAllByText(/代表者ID/).length).toBeGreaterThanOrEqual(1);
  });

  it('団体名が詳細画面（/facilities/groups/[id]）へのリンクになっている', async () => {
    vi.mocked(facilityHelpers.getRegistrationGroups).mockResolvedValue(
      mockGroups as any,
    );

    render(<GroupsPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroups,
      ).toHaveBeenCalled();
    });

    const linkA = screen.getByRole('link', { name: 'テスト団体A' });
    const linkB = screen.getByRole('link', { name: 'テスト団体B' });

    expect(linkA).toBeInTheDocument();
    expect(linkB).toBeInTheDocument();
    expect(linkA).toHaveAttribute('href', '/facilities/groups/grp-1');
    expect(linkB).toHaveAttribute('href', '/facilities/groups/grp-2');
  });
});
