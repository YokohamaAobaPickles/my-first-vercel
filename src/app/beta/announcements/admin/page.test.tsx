/**
 * Filename: src/app/announcements/admin/page.test.tsx
 * Version : V1.4.0
 * Update  : 2026-02-12
 * Remarks :
 * V1.4.0 - AnnouncementListItem 型に完全準拠するよう mockData を修正。
 *        - useAuthCheck の戻り値型を最新仕様に合わせて統一。
 *        - VS Code の型エラーをすべて解消。
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnnouncementAdminPage from './page';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import * as announcementApi from '@/lib/announcementApi';
import { AnnouncementStatus } from '@/types/announcement';

/* -------------------------------------------------------
 *  モック設定
 * ----------------------------------------------------- */

// next/navigation のモック
const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// API / Auth モック
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');

// next/link のモック
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// AnnouncementListItem 型に必須のプロパティ
const baseAnnouncement = {
  content: '',
  is_read: false,
  status: 'published' as AnnouncementStatus,   // 文字列ではなく型として明示
  read_count: 0,
  target_role: 'all',
  created_at: '2026-02-10T00:00:00Z',
  updated_at: '2026-02-10T00:00:00Z',
};

// デフォルトは管理者ログイン
function mockAdmin() {
  vi.mocked(useAuthCheck).mockReturnValue({
    isLoading: false,
    user: { id: 'admin-1' },
    userRoles: ['president'],
    currentLineId: null,
    lineNickname: null,
  });
}

/* -------------------------------------------------------
 *  テスト本体
 * ----------------------------------------------------- */

describe('AnnouncementAdminPage (UI Test)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin();
  });

  /* -------------------------------------------------------
   * 1. 権限ガード
   * ----------------------------------------------------- */
  it('管理者権限がない場合、一般一覧ページへリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'user-1' },
      userRoles: ['general'],
      currentLineId: null,
      lineNickname: null,
    });

    render(<AnnouncementAdminPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/announcements');
    });
  });

  /* -------------------------------------------------------
   * 2. 管理者用一覧の基本表示
   * ----------------------------------------------------- */
  it('管理者権限がある場合、記事・重要ラベル・ステータス・既読数が表示されること', async () => {
    const mockData = [
      {
        ...baseAnnouncement,
        announcement_id: 101,
        title: '管理用テスト記事',
        status: 'draft' as AnnouncementStatus, // ← ここに as AnnouncementStatus を追加
        is_pinned: true,
        publish_date: '2026-02-10',
        read_count: 5,
      },
    ];

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: mockData,
    });

    render(<AnnouncementAdminPage />);

    await waitFor(() => {
      expect(announcementApi.fetchAnnouncements).toHaveBeenCalledWith('admin-1');
    });

    expect(await screen.findByText('管理用テスト記事')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByText('下書き')).toBeInTheDocument();

    const readLink = screen.getByText(/👀.*5/);
    expect(readLink.closest('a')).toHaveAttribute(
      'href',
      '/announcements/admin/101'
    );
  });

  /* -------------------------------------------------------
   * 3. 並び順（重要 → 公開日の降順）
   * ----------------------------------------------------- */
  it('重要記事が最優先で表示され、次に公開日の降順で並ぶこと', async () => {
    const mockData = [
      {
        ...baseAnnouncement,
        announcement_id: 1,
        title: '古い公開記事',
        content: '',
        status: 'published' as AnnouncementStatus,
        is_pinned: false,
        is_read: false,
        publish_date: '2026-01-01',
        read_count: 0,
        target_role: 'all',     // ← union 型に一致
        created_at: '2026-02-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
      },
      {
        ...baseAnnouncement,
        announcement_id: 2,
        title: '新しい公開記事',
        content: '',
        status: 'published'as AnnouncementStatus,
        is_pinned: false,
        is_read: false,
        publish_date: '2026-02-01',
        read_count: 0,
        target_role: 'all',     // ← union 型に一致
        created_at: '2026-02-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
      },
      {
        ...baseAnnouncement,
        announcement_id: 3,
        title: '重要なお知らせ',
        content: '',
        status: 'published'as AnnouncementStatus,
        is_pinned: true,
        is_read: false,
        publish_date: '2026-01-15',
        read_count: 0,
        target_role: 'all',     // ← union 型に一致
        created_at: '2026-02-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
      },
    ];

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: mockData,
    });

    render(<AnnouncementAdminPage />);

    const titles = await screen.findAllByRole('heading', { level: 3 });
    const titleTexts = titles.map((el) => el.textContent);

    expect(titleTexts).toEqual([
      '重要なお知らせ',
      '新しい公開記事',
      '古い公開記事',
    ]);
  });

  /* -------------------------------------------------------
   * 4. 編集リンク
   * ----------------------------------------------------- */
  it('編集ボタンが正しい編集ページへのリンクを持つこと', async () => {
    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: [
        {
          ...baseAnnouncement,
          announcement_id: 102,
          title: '編集テスト',
          status: 'published',
          is_pinned: false,
          is_read: false,
          publish_date: '2026-02-12',
          read_count: 0,
          target_role: 'all',     // ← union 型に一致
          created_at: '2026-02-10T00:00:00Z',
          updated_at: '2026-02-10T00:00:00Z',
        },
      ],
    });

    render(<AnnouncementAdminPage />);

    const editBtn = await screen.findByText('編集');
    expect(editBtn.closest('a')).toHaveAttribute(
      'href',
      '/announcements/edit/102'
    );
  });

  /* -------------------------------------------------------
   * 5. 新規作成ボタン
   * ----------------------------------------------------- */
  it('新規作成ボタンが存在し、正しいリンク先であること', async () => {
    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AnnouncementAdminPage />);

    const newBtn = await screen.findByText('新規作成');
    expect(newBtn.closest('a')).toHaveAttribute('href', '/announcements/new');
  });
});
