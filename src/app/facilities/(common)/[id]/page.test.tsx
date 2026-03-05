/**
 * Filename: src/app/facilities/(common)/[id]/page.test.tsx
 * Version: V1.3.1
 * Update: 2026-03-05
 * Remarks:
 * V1.3.1
 * - 編集リンクのパスと権限制御テストを調整
 * V1.3.0
 * - 権限制御と admin パス特例のテストを追加
 * V1.2.1
 * - null項目時の表示検証を getAllByText による複数要素検証に修正
 * V1.2.0
 * - ラベル＋値の厳密検証とモックの分離（全データ/一部欠損）
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

import FacilityDetailPage from '@/app/facilities/(common)/[id]/page';
import { useParams } from 'next/navigation';
import { getFacilityById } from '@/utils/facilityHelpers';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import * as authUtils from '@/utils/auth';

vi.mock('@/utils/facilityHelpers', () => ({
  getFacilityById: vi.fn(),
}));

vi.mock('@/hooks/useAuthCheck');
vi.mock('@/utils/auth');

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

const mockId = 'facility-detail-1';

/** 全項目ありのベースモック。it 内で mockResolvedValue を上書き可能。 */
const baseMockFacility = {
  id: mockId,
  facility_name: 'テスト施設',
  address: '東京都新宿区',
  map_url: 'https://maps.example.com',
  facility_notes: 'インドア2面',
  registration_group_id: null as string | null,
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

describe('FacilityDetailPage (施設詳細)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: mockId } as any);
    vi.mocked(getFacilityById).mockResolvedValue(
      baseMockFacility as any
    );
    vi.mocked(useAuthCheck).mockReturnValue({
      user: null,
      userRoles: null,
      isLoading: false,
    } as any);
    vi.mocked(authUtils.canManageFacilities).mockReturnValue(true);
  });

  it('IDに基づいて施設情報が取得され、施設名・住所・地図URL・備考が表示される',
    async () => {
      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      expect(screen.getByText('テスト施設')).toBeInTheDocument();
      expect(screen.getByText('東京都新宿区')).toBeInTheDocument();
      const mapLink = screen.getByRole('link', {
        name: 'https://maps.example.com',
      });
      expect(mapLink).toHaveAttribute(
        'href',
        'https://maps.example.com'
      );
      expect(screen.getByText('インドア2面')).toBeInTheDocument();
    });

  it('「編集する」リンクが /facilities/admin/edit/[id] を指す',
    async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        user: { id: 'admin-1' },
        userRoles: ['admin'],
        isLoading: false,
      } as any);
      vi.mocked(authUtils.canManageFacilities)
        .mockReturnValue(true);

      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      const editLink = screen.getByRole('link', {
        name: '編集する',
      });
      expect(editLink).toHaveAttribute(
        'href',
        `/facilities/admin/edit/${mockId}`
      );
    });

  it('「一覧に戻る」リンクが /facilities を指す', async () => {
    render(<FacilityDetailPage />);

    await waitFor(() => {
      expect(getFacilityById).toHaveBeenCalledWith(mockId);
    });

    const backLink = screen.getByRole('link', {
      name: '一覧に戻る',
    });
    expect(backLink).toHaveAttribute('href', '/facilities');
  });

  it('データ取得中に「読み込み中...」が表示される', async () => {
    let resolve: (v: any) => void;
    vi.mocked(getFacilityById).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    );

    render(<FacilityDetailPage />);

    expect(
      screen.getByText('読み込み中...')
    ).toBeInTheDocument();

    resolve!(baseMockFacility);

    await waitFor(() => {
      expect(screen.getByText('テスト施設')).toBeInTheDocument();
    });
  });

  it('全てのデータがある場合、電話番号のラベルと値がセットで表示される',
    async () => {
      vi.mocked(getFacilityById).mockResolvedValue(
        baseMockFacility as any
      );
      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      expect(screen.getByText('電話番号')).toBeInTheDocument();
      expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
    });

  it('全てのデータがある場合、メール・更新期限・駐車場台数のラベルと値が表示される',
    async () => {
      vi.mocked(getFacilityById).mockResolvedValue(
        baseMockFacility as any
      );
      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      expect(screen.getByText('メール')).toBeInTheDocument();
      expect(screen.getByText('info@example.com')).toBeInTheDocument();
      expect(screen.getByText('更新期限')).toBeInTheDocument();
      expect(screen.getByText('2027-03-31')).toBeInTheDocument();
      expect(screen.getByText('駐車場台数')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

  it('全てのデータがある場合、公式サイトURL のラベルとリンクが表示される',
    async () => {
      vi.mocked(getFacilityById).mockResolvedValue(
        baseMockFacility as any
      );
      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      expect(screen.getByText('公式サイト')).toBeInTheDocument();
      const officialLink = screen.getByRole('link', {
        name: 'https://facility.example.jp',
      });
      expect(officialLink).toHaveAttribute(
        'href',
        'https://facility.example.jp'
      );
    });

  it('一部の項目が null の場合、ラベルは表示され値は未登録表示される',
    async () => {
      vi.mocked(getFacilityById).mockResolvedValue({
        ...baseMockFacility,
        phone: null,
        email: null,
        facility_url: null,
      } as any);
      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      expect(screen.getByText('電話番号')).toBeInTheDocument();
      expect(screen.getByText('メール')).toBeInTheDocument();
      expect(screen.getByText('公式サイト')).toBeInTheDocument();
      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBe(3);
    });

  it('一般ユーザーには「編集する」ボタンが表示されないこと',
    async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        user: { id: 'user-1' },
        userRoles: ['member'],
        isLoading: false,
      } as any);
      vi.mocked(authUtils.canManageFacilities)
        .mockReturnValue(false);

      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      const edit = screen.queryByRole('link', {
        name: '編集する',
      });
      expect(edit).not.toBeInTheDocument();
    });

  it('管理権限がある場合のみ「編集する」ボタンが表示されること',
    async () => {
      vi.mocked(useAuthCheck).mockReturnValue({
        user: { id: 'admin-1' },
        userRoles: ['admin'],
        isLoading: false,
      } as any);
      vi.mocked(authUtils.canManageFacilities)
        .mockReturnValue(true);

      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).toHaveBeenCalledWith(mockId);
      });

      const editLink = screen.getByRole('link', {
        name: '編集する',
      });
      expect(editLink).toHaveAttribute(
        'href',
        `/facilities/admin/edit/${mockId}`
      );
    });

  it('idがadminの場合はAPIを呼ばず何も描画しないこと',
    async () => {
      vi.mocked(useParams).mockReturnValue({
        id: 'admin',
      } as any);

      render(<FacilityDetailPage />);

      await waitFor(() => {
        expect(getFacilityById).not.toHaveBeenCalled();
      });

      const title = screen.queryByText('施設詳細');
      expect(title).toBeNull();
    });
});
