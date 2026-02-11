/**
 * Filename: src/app/announcements/admin/[id]/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.1.0 B-15 既読詳細表示のテスト。新スキーマ・API対応および表示項目の検証。
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnnouncementReadDetailPage from './page';
import * as announcementApi from '@/lib/announcementApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter, useParams } from 'next/navigation';

// モック設定
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AnnouncementReadDetailPage (UI Test)', () => {
  const mockRouter = { push: vi.fn() };
  const mockId = '101';

  beforeEach(() => {
    vi.clearAllMocks();

    // URLパラメータの指定
    vi.mocked(useParams).mockReturnValue({ id: mockId });

    // デフォルトは管理者ログイン
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1' },
      userRoles: ['president'],
    } as any);

    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('管理者権限がない場合、一般一覧へリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'user-1' },
      userRoles: ['general'],
    } as any);

    render(<AnnouncementReadDetailPage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/announcements');
    });
  });

  it('記事タイトルと既読者リスト（会員番号・ニックネーム・メール）が表示されること', async () => {
    // 記事情報のモック
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: {
        announcement_id: 101,
        title: '重要：システムメンテナンス',
      } as any,
    });

    // 既読詳細のモック（要件：会員番号＋ニックネーム＋メアドを表示）
    const mockReadDetails = [
      {
        read_at: '2026-02-09T10:00:00Z',
        member_id: 'user-uuid-1',
        members: {
          member_number: '0015', // 会員番号
          nickname: 'テニス太郎',
          email: 'taro@example.com',
          name: '山田太郎'
        }
      }
    ];

    vi.mocked(announcementApi.fetchReadDetails).mockResolvedValue({
      success: true,
      data: mockReadDetails as any,
    });

    render(<AnnouncementReadDetailPage />);

    // API 呼び出し検証（追加）
    await waitFor(() => {
      expect(announcementApi.fetchAnnouncementById).toHaveBeenCalledWith(101);
      expect(announcementApi.fetchReadDetails).toHaveBeenCalledWith(101);
    });

    // 記事タイトルの表示確認（heading を使う）
    expect(
      await screen.findByRole('heading', { name: /重要：システムメンテナンス/ })
    ).toBeInTheDocument();

    // 既読者情報の表示確認
    expect(screen.getByText(/0015/)).toBeInTheDocument();
    expect(screen.getByText(/テニス太郎/)).toBeInTheDocument();
    expect(screen.getByText(/taro@example.com/)).toBeInTheDocument();
  });

  it('既読データがない場合に適切なメッセージが表示されること', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: { title: 'データなしテスト' } as any,
    });

    vi.mocked(announcementApi.fetchReadDetails).mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AnnouncementReadDetailPage />);

    expect(await screen.findByText('既読データはありません')).toBeInTheDocument();
  });

  it('データの取得に失敗した場合にエラーメッセージが表示されること', async () => {
    vi.mocked(announcementApi.fetchReadDetails).mockResolvedValue({
      success: false,
      error: { message: '通信エラーが発生しました' },
      data: null
    });

    render(<AnnouncementReadDetailPage />);

    expect(await screen.findByText('通信エラーが発生しました')).toBeInTheDocument();
  });
});
