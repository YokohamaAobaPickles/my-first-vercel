/**
 * Filename: src/app/announcements/admin/edit/[id]/page.test.tsx
 * Version : V1.1.0
 * Update  : 2026-02-09
 * Remarks : B-12 お知らせ編集・削除機能のテスト。新API・新スキーマ対応を検証。
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditAnnouncementPage from './page';
import * as announcementApi from '@/lib/announcementApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter, useParams } from 'next/navigation';

import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

describe('EditAnnouncementPage (B-12)', () => {
  const mockRouter = { push: vi.fn() };
  const mockId = '101';
  const mockAnnouncement = {
    announcement_id: 101,
    title: '既存のタイトル',
    content: '既存の本文',
    publish_date: '2026-02-01',
    status: 'published',
    is_pinned: true,
    target_role: 'all',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: mockId });
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);

    // 管理者ロールでモック
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'admin-1' },
      userRoles: ['president'],
    } as any);
  });

  it('管理者権限がない場合、一般一覧へリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'user-1' },
      userRoles: ['general'],
    } as any);

    render(<EditAnnouncementPage />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/announcements');
    });
  });

  it('初期表示時に既存データがフォームにロードされること', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: mockAnnouncement as any,
    });

    render(<EditAnnouncementPage />);

    // API 呼び出し検証 
    await waitFor(() => {
      expect(announcementApi.fetchAnnouncementById).toHaveBeenCalledWith(101);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('既存のタイトル')).toBeInTheDocument();
      expect(screen.getByDisplayValue('既存の本文')).toBeInTheDocument();
    });
  });

  it('更新ボタンクリックで updateAnnouncement API が呼ばれること', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: mockAnnouncement as any,
    });
    vi.mocked(announcementApi.updateAnnouncement).mockResolvedValue({
      success: true,
      data: null,
    });

    render(<EditAnnouncementPage />);

    // ロード待ち
    const titleInput = await screen.findByDisplayValue('既存のタイトル');

    // 値を変更
    fireEvent.change(titleInput, { target: { value: '更新後のタイトル' } });

    // 更新実行
    const updateButton = screen.getByRole('button', { name: /更新する/ });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(announcementApi.updateAnnouncement).toHaveBeenCalledWith(
        101,
        expect.objectContaining({ title: '更新後のタイトル' })
      );
      expect(mockRouter.push).toHaveBeenCalledWith('/announcements/admin');
    });
  });

  it('削除ボタンクリックで確認ダイアログ後に deleteAnnouncement が呼ばれること', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: mockAnnouncement as any,
    });
    vi.mocked(announcementApi.deleteAnnouncement).mockResolvedValue({
      success: true,
      data: null,
    });

    // window.confirm をモック
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<EditAnnouncementPage />);
    await screen.findByDisplayValue('既存のタイトル');

    const deleteButton = screen.getByRole('button', { name: /この記事を完全に削除/ });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(announcementApi.deleteAnnouncement).toHaveBeenCalledWith(101);
      expect(mockRouter.push).toHaveBeenCalledWith('/announcements/admin');
    });
  });

  it('削除確認ダイアログでキャンセルした場合、deleteAnnouncement が呼ばれないこと', async () => {
    vi.mocked(announcementApi.fetchAnnouncementById).mockResolvedValue({
      success: true,
      data: mockAnnouncement as any,
    });

    // confirm を false にする
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EditAnnouncementPage />);
    await screen.findByDisplayValue('既存のタイトル');

    const deleteButton = screen.getByRole('button', { name: /この記事を完全に削除/ });
    fireEvent.click(deleteButton);

    // confirm が呼ばれたこと
    expect(confirmSpy).toHaveBeenCalled();

    // ★ deleteAnnouncement は呼ばれない
    expect(announcementApi.deleteAnnouncement).not.toHaveBeenCalled();

    // ★ router.push も呼ばれない
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

});