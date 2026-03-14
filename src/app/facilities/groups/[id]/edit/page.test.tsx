/**
 * Filename: src/app/facilities/groups/[id]/edit/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-02 登録団体情報の更新をテスト。getRegistrationGroupById / updateRegistrationGroupInfo をモック。
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

import EditRegistrationGroupPage from '@/app/facilities/groups/[id]/edit/page';
import GroupsPage from './page';
import { useRouter, useParams } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

const mockId = 'grp-1';

const mockGroup = {
  id: mockId,
  registration_club_name: 'テスト団体A',
  registration_club_number: 'G-001',
  representative_id: 'mem-1',
  vice_representative_id: 'mem-2',
  registration_club_notes: '団体の備考です',
};

describe('EditRegistrationGroupPage (登録団体編集 F-02)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    vi.mocked(facilityHelpers.getRegistrationGroupById).mockResolvedValue(
      mockGroup as any,
    );
  });

  it('getRegistrationGroupById で取得した初期値がフォームに表示される', async () => {
    render(<EditRegistrationGroupPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(screen.getByDisplayValue('テスト団体A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('G-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('mem-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('mem-2')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('団体の備考です'),
    ).toBeInTheDocument();
  });

  it('値を書き換えて「保存する」をクリックすると updateRegistrationGroupInfo が変更後の値で呼ばれる', async () => {
    vi.mocked(facilityHelpers.updateRegistrationGroupInfo).mockResolvedValue({
      ...mockGroup,
      registration_club_name: '更新後団体名',
    } as any);

    render(<EditRegistrationGroupPage />);

    await screen.findByDisplayValue('テスト団体A');

    fireEvent.change(screen.getByLabelText(/団体名/), {
      target: { value: '更新後団体名' },
    });
    fireEvent.change(screen.getByLabelText(/団体番号/), {
      target: { value: 'G-002' },
    });
    fireEvent.change(screen.getByLabelText(/^代表者ID$/), {
      target: { value: 'mem-3' },
    });
    fireEvent.change(screen.getByLabelText(/^副代表者ID$/), {
      target: { value: 'mem-4' },
    });
    fireEvent.change(screen.getByLabelText(/備考/), {
      target: { value: '更新後の備考' },
    });

    const saveButton = screen.getByRole('button', { name: /保存する/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        facilityHelpers.updateRegistrationGroupInfo,
      ).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          registration_club_name: '更新後団体名',
          registration_club_number: 'G-002',
          representative_id: 'mem-3',
          vice_representative_id: 'mem-4',
          registration_club_notes: '更新後の備考',
        }),
      );
    });
  });

  it('保存後は詳細画面 /facilities/groups/[id] へ遷移する', async () => {
    vi.mocked(facilityHelpers.updateRegistrationGroupInfo).mockResolvedValue(
      mockGroup as any,
    );

    render(<EditRegistrationGroupPage />);

    await screen.findByDisplayValue('テスト団体A');

    fireEvent.change(screen.getByLabelText(/団体名/), {
      target: { value: '変更後' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/facilities/groups/grp-1',
      );
    });
  });
});
