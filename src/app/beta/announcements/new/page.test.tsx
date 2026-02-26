/**
 * Filename: src/app/announcements/new/page.test.tsx
 * Version : V1.4.0
 * Update  : 2026-02-12
 * Remarks : 
 * V1.4.0
 * - 新デザインに伴うボタン名変更（投稿する -> 作成する）に対応。
 * - キャンセルボタンの遷移テストを追加。
 * V1.3.1
 * - API失敗時のエラー表示テストの安定性を向上
 * V1.3.0
 * - 新規作成後の遷移先を /announcements/admin に変更（仕様変更）
 * - 権限なしユーザーのリダイレクトテストを追加（B-11 ガード強化）
 *  * V1.2.0 B-11 新規作成画面のテスト。announcementApi.createAnnouncement の呼び出しを検証。
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewAnnouncementPage from './page';
import * as announcementApi from '@/lib/announcementApi';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewAnnouncementPage (B-11)', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockUser = { id: 'user-uuid-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ 
      push: mockPush, 
      replace: mockReplace 
    } as any);
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      userRoles: ['system_admin'],
      user: mockUser,
    } as any);
  });

  it('フォーム入力後に createAnnouncement が呼ばれ、管理者一覧へ遷移すること', async () => {
    vi.mocked(announcementApi.createAnnouncement).mockResolvedValue({
      success: true,
      data: { announcement_id: 1 } as any,
    });

    render(<NewAnnouncementPage />);

    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: 'テストタイトル' },
    });
    fireEvent.change(screen.getByLabelText(/本文/), {
      target: { value: 'テスト本文内容' },
    });

    // ★ ボタン名を「作成」に変更
    const submitBtn = screen.getByRole('button', { name: '作成' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(announcementApi.createAnnouncement).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'テストタイトル',
          content: 'テスト本文内容',
          status: 'published',
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/announcements/admin');
    });
  });

  it('キャンセルボタンをクリックすると管理一覧へ戻ること', async () => {
    render(<NewAnnouncementPage />);
    
    // ★ キャンセルボタンの検証を追加
    const cancelBtn = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelBtn);

    expect(mockPush).toHaveBeenCalledWith('/announcements/admin');
  });

  it('管理者権限がない場合、一般一覧へリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      userRoles: ['general'],
      user: mockUser,
    } as any);

    render(<NewAnnouncementPage />);

    await waitFor(() => {
      // 本体側が router.replace を使っている場合はこちらを検証
      expect(mockReplace).toHaveBeenCalledWith('/announcements');
    });
  });
});