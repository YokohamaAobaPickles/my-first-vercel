/**
 * Filename: src/app/announcements/[id]/AnnouncementDetailPage.test.tsx
 * Version : V1.1.0
 * Update  : 2026-02-08
 * Remarks : 
 * V1.1.0
 * - 既読処理の検証順序（render の後に expect）を修正
 * V1.0.0
 * - お知らせ詳細表示(B-02)と既読記録(B-03)の連動テスト
 * - fetchAnnouncementById および recordRead の呼び出しを検証
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnnouncementDetailPage from './page';
import * as announcementApi from '@/lib/announcementApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';

// matcher 拡張
import '@testing-library/jest-dom/vitest';

// モック
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
// useParams をモックして ID を渡す
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '100' }),
  useRouter: () => ({ back: vi.fn() }),
}));

describe('AnnouncementDetailPage (UI)', () => {
  const mockUser = { id: 'user-123' };
  const mockAnnouncement = {
    announcement_id: 100,
    title: '詳細テスト記事',
    content: 'これはお知らせの本文です。',
    publish_date: '2026-02-08',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: mockUser,
      userRoles: ['general'],
    } as any);
  });

it('記事詳細が正しく表示され、既読処理が実行されること', async () => {
    // API のレスポンスをモック
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: mockAnnouncement as any,
    });
    vi.mocked(announcementApi.recordRead).mockResolvedValue({
      success: true,
      data: null,
    });

    // 先にレンダリングを実行する
    render(<AnnouncementDetailPage />);

    // 1. 表示内容の確認
    expect(await screen.findByText('詳細テスト記事')).toBeInTheDocument();
    expect(screen.getByText('これはお知らせの本文です。')).toBeInTheDocument();
    expect(screen.getByText('2026-02-08')).toBeInTheDocument();

    // 2. 既読にする API が呼ばれたか検証 (render の後なのでパスするはず)
    await waitFor(() => {
      expect(announcementApi.recordRead).toHaveBeenCalledWith(100, 'user-123');
    });
  });

  it('記事が見つからない場合、適切なメッセージが表示されること', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: false,
      data: null,
      error: { message: 'Not Found' },
    });


    render(<AnnouncementDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('お知らせが見つかりません。')).toBeInTheDocument();
    });
  });

  it('読み込み中が表示されること', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: true,
      user: null,
      userRoles: [],
    } as any);

    render(<AnnouncementDetailPage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

});