/**
 * Filename: src/app/facilities/(admin)/groups/[id]/page.test.tsx
 * Version: V1.0.1
 * Update: 2026-03-05
 * Remarks: F-05 登録団体詳細参照・F-03 登録団体削除のテスト。
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

import RegistrationGroupDetailPage from '@/app/facilities/(admin)/groups/[id]/page';
import GroupsPage from './page';
import { useParams, useRouter } from 'next/navigation';
import * as facilityHelpers from '@/utils/facilityHelpers';

vi.mock('@/utils/facilityHelpers');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
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

describe('RegistrationGroupDetailPage (登録団体詳細 F-05 / F-03)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any);
    vi.mocked(facilityHelpers.getRegistrationGroupById).mockResolvedValue(
      mockGroup as any,
    );
  });

  it('params の id で getRegistrationGroupById が呼ばれ、団体名・団体番号・代表者ID・副代表者ID・備考が表示される', async () => {
    render(<RegistrationGroupDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(screen.getByText('テスト団体A')).toBeInTheDocument();
    expect(screen.getByText('G-001')).toBeInTheDocument();
    expect(screen.getByText('mem-1')).toBeInTheDocument();
    expect(screen.getByText('mem-2')).toBeInTheDocument();
    expect(screen.getByText('団体の備考です')).toBeInTheDocument();
  });

  it('「編集する」が /facilities/groups/[id]/edit へのリンクとして存在する', async () => {
    render(<RegistrationGroupDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    const editLink = screen.getByRole('link', { name: /編集する/ });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      'href',
      '/facilities/groups/grp-1/edit',
    );
  });

  it('「一覧へ戻る」が /facilities/groups へのリンクとして存在する', async () => {
    render(<RegistrationGroupDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    const backLink = screen.getByRole('link', { name: /一覧へ戻る/ });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/facilities/groups');
  });

  it('「削除する」ボタンが存在する', async () => {
    render(<RegistrationGroupDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    expect(
      screen.getByRole('button', { name: /削除する/ }),
    ).toBeInTheDocument();
  });

  it('「削除する」押下で confirm を表示し、OK で removeRegistrationGroup(id) を呼び、成功後に一覧へ遷移する', async () => {
    vi.mocked(facilityHelpers.removeRegistrationGroup).mockResolvedValue(
      true,
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<RegistrationGroupDetailPage />);

    await waitFor(() => {
      expect(
        facilityHelpers.getRegistrationGroupById,
      ).toHaveBeenCalledWith(mockId);
    });

    const deleteButton = screen.getByRole('button', { name: /削除する/ });
    deleteButton.click();

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        facilityHelpers.removeRegistrationGroup,
      ).toHaveBeenCalledWith(mockId);
      expect(mockPush).toHaveBeenCalledWith('/facilities/groups');
    });

    confirmSpy.mockRestore();
  });
});
