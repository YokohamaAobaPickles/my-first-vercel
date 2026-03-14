/**
 * Filename: src/app/facilities/groups/new/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 * Remarks: F-01 登録団体情報の登録をテストファーストで実装するためのテスト。
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

import NewRegistrationGroupPage from '@/app/facilities/groups/new/page';
import { useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewRegistrationGroupPage (登録団体新規登録 F-01)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('団体名・団体番号・代表者ID・副代表者ID・備考の入力フィールドと「保存する」ボタンがある', () => {
    render(<NewRegistrationGroupPage />);

    expect(screen.getByLabelText(/団体名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/団体番号/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^代表者ID$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^副代表者ID$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/備考/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /保存する/ }),
    ).toBeInTheDocument();
  });

  it('各項目に入力し「保存する」を押すと createRegistrationGroup が正しい引数で呼ばれる', async () => {
    vi.mocked(facilityHelpers.createRegistrationGroup).mockResolvedValue({
      id: 'grp-1',
      registration_club_name: 'テスト団体',
      registration_club_number: 'G-001',
      representative_id: 'mem-1',
      vice_representative_id: 'mem-2',
      registration_club_notes: '備考テキスト',
    } as any);

    render(<NewRegistrationGroupPage />);

    fireEvent.change(screen.getByLabelText(/団体名/), {
      target: { value: 'テスト団体' },
    });
    fireEvent.change(screen.getByLabelText(/団体番号/), {
      target: { value: 'G-001' },
    });
    fireEvent.change(screen.getByLabelText(/^代表者ID$/), {
      target: { value: 'mem-1' },
    });
    fireEvent.change(screen.getByLabelText(/副代表者ID/), {
      target: { value: 'mem-2' },
    });
    fireEvent.change(screen.getByLabelText(/備考/), {
      target: { value: '備考テキスト' },
    });

    const saveButton = screen.getByRole('button', { name: /保存する/ });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        facilityHelpers.createRegistrationGroup,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          registration_club_name: 'テスト団体',
          registration_club_number: 'G-001',
          representative_id: 'mem-1',
          vice_representative_id: 'mem-2',
          registration_club_notes: '備考テキスト',
        }),
      );
    });
  });

  it('保存成功後、一覧画面 /facilities/groups へ遷移する', async () => {
    vi.mocked(facilityHelpers.createRegistrationGroup).mockResolvedValue({
      id: 'grp-1',
      registration_club_name: 'テスト団体',
      registration_club_number: 'G-001',
      representative_id: null,
      vice_representative_id: null,
      registration_club_notes: null,
    } as any);

    render(<NewRegistrationGroupPage />);

    fireEvent.change(screen.getByLabelText(/団体名/), {
      target: { value: 'テスト団体' },
    });
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/facilities/groups');
    });
  });
});
