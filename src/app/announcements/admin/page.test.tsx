/**
 * Filename: src/app/announcements/admin/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.1.0 管理者向け一覧(B-11~15)のテスト。リダイレクト、既読数表示、遷移を検証。
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnnouncementAdminPage from './page';
import * as announcementApi from '@/lib/announcementApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

// matcher 拡張
import '@testing-library/jest-dom/vitest';

// モック設定
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AnnouncementAdminPage (UI Test)', () => {
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトは管理者ログイン
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1' },
      userRoles: ['president'],
    } as any);

    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('管理者権限がない場合、一般一覧ページへリダイレクトされること', async () => {
    // 一般ユーザー(general)としてログイン
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'user-1' },
      userRoles: ['general'],
    } as any);

    render(<AnnouncementAdminPage />);

    // 権限がないためリダイレクトが呼ばれることを確認
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/announcements');
    });
  });

  it('管理者権限がある場合、全てのお知らせと既読数が表示されること', async () => {

    const mockData = [
      {
        announcement_id: 101,
        title: '管理用テスト記事',
        status: 'draft',
        is_pinned: true,
        publish_date: '2026-02-10',
        read_count: 5,
      },
    ];

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: mockData as any,
    });

    render(<AnnouncementAdminPage />);

    await waitFor(() => {
      expect(announcementApi.fetchAnnouncements).toHaveBeenCalledWith('admin-1');
    });

    // 各要素の表示確認
    expect(await screen.findByText('管理用テスト記事')).toBeInTheDocument();
    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByText('下書き')).toBeInTheDocument();

    // 既読数部分が詳細へのリンクになっていること
    const readLink = screen.getByText('👀 5');
    expect(readLink.closest('a')).toHaveAttribute(
      'href',
      '/announcements/admin/101'
    );
  });

  it('重要記事が最優先で表示され、次に公開日の降順で並ぶこと', async () => {

    const mockData = [
      {
        announcement_id: 1,
        title: '古い公開記事',
        status: 'published',
        is_pinned: false,
        publish_date: '2026-01-01',
        read_count: 0,
      },
      {
        announcement_id: 2,
        title: '新しい公開記事',
        status: 'published',
        is_pinned: false,
        publish_date: '2026-02-01',
        read_count: 0,
      },
      {
        announcement_id: 3,
        title: '重要なお知らせ',
        status: 'published',
        is_pinned: true,
        publish_date: '2026-01-15',
        read_count: 0,
      },
    ];

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: mockData as any,
    });

    render(<AnnouncementAdminPage />);

    // DOM 上の表示順を取得
    const titles = await screen.findAllByRole('heading', { level: 3 });

    const titleTexts = titles.map((el) => el.textContent);

    // ★ 期待する順序
    expect(titleTexts).toEqual([
      '重要なお知らせ',     // is_pinned = true → 最優先
      '新しい公開記事',     // publish_date が新しい
      '古い公開記事',       // publish_date が古い
    ]);
  });

  it('編集ボタンをクリックすると編集ページへのリンクがあること', async () => {

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: [{ announcement_id: 102, title: '編集テスト', status: 'published' }] as any,
    });

    render(<AnnouncementAdminPage />);

    const editBtn = await screen.findByText('編集');
    expect(editBtn.closest('a')).toHaveAttribute(
      'href',
      '/announcements/edit/102'
    );
  });
});