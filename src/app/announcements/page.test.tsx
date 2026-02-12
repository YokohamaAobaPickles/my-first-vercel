/**
 * Filename: src/app/announcements/AnnouncementsPage.test.tsx
 * Version : V1.2.2
 * Update  : 2026-02-08
 * Remarks :
 * V1.2.2
 * - Link モックが style プロパティを無視していた問題を修正 
 * V1.2.1
 * - fontWeight の検証を jsdom の挙動に合わせて文字列期待に調整
 * V1.2.0
 * - 現状の UI（supabase 直叩き）ではなく、
 *   今後の UI（fetchAnnouncements(memberId)）を前提とした TDD テスト。
 * - fetchAnnouncements が呼ばれることを検証。
 * - is_read / is_pinned の表示を検証。
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';

import AnnouncementsPage from './page';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { AnnouncementListItem } from '@/types/announcement';
import * as announcementApi from '@/lib/announcementApi';

// モック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
    push: vi.fn(),
  })),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, style }: {
    children: React.ReactNode;
    href: string;
    style?: React.CSSProperties
  }) => (
    <a href={href} style={style}>{children}</a>
  ),
}));
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');

describe('AnnouncementsPage (UI)', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: mockUser,
      userRoles: ['general'],
      currentLineId: 'line-123',
      lineNickname: 'TestUser',
    } as any);
  });

  it('データがある場合、お知らせ一覧が正しく表示されること', async () => {
    // API の戻り値をセット
    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: [
        {
          announcement_id: 1,
          title: 'テストお知らせ',
          is_read: false,
          is_pinned: false,
          publish_date: '2026-02-12',
        } as any
      ],
    });

    render(<AnnouncementsPage />);

    // 「読み込み中」を通り越して、タイトルが表示されるのを待つ
    expect(await screen.findByText('テストお知らせ')).toBeInTheDocument();
  });

  it('お知らせが1件もない場合、「現在お知らせはありません。」と表示されること', async () => {
    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AnnouncementsPage />);

    await waitFor(() => {
      expect(screen.getByText('現在お知らせはありません。')).toBeInTheDocument();
    });

    // fetchAnnouncements がログインユーザーIDを受け取っていること
    expect(announcementApi.fetchAnnouncements).toHaveBeenCalledWith('user-123');
  });

  it('未読/既読・重要ラベルが正しく表示されること', async () => {
    const mockData = [
      {
        announcement_id: 1,
        title: '未読のお知らせ',
        is_read: false,
        is_pinned: false,
        publish_date: '2026-02-01',
      },
      {
        announcement_id: 2,
        title: '既読のお知らせ',
        is_read: true,
        is_pinned: true,
        publish_date: '2026-02-05',
      },
    ];

    vi.mocked(announcementApi.fetchAnnouncements).mockResolvedValue({
      success: true,
      data: mockData as any,
    });

    render(<AnnouncementsPage />);

    // fetchAnnouncements がログインユーザーIDを受け取っていること
    expect(announcementApi.fetchAnnouncements).toHaveBeenCalledWith('user-123');

    // 重要ラベル
    expect(await screen.findByText('重要')).toBeInTheDocument();

    // タイトル
    const unreadTitle = screen.getByText('未読のお知らせ');
    const readTitle = screen.getByText('既読のお知らせ');

    // スタイル検証：文字列として '700' / '400' を期待する
    expect(unreadTitle).toHaveStyle('font-weight: 700');
    expect(readTitle).toHaveStyle('font-weight: 400');

    // 既読済みテキスト
    // \( と \) でカッコ自体をエスケープし、タイトルとの重複を避ける
    expect(screen.getByText(/\(既読\)/)).toBeInTheDocument();
  });
});
