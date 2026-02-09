/**
 * Filename: src/app/announcements/new/page.test.tsx
 * Version : V1.3.1
 * Update  : 2026-02-09
 * Remarks : 
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

import '@testing-library/jest-dom/vitest';

// モック
vi.mock('@/lib/announcementApi');
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NewAnnouncementPage (B-11)', () => {
  const mockPush = vi.fn();
  const mockUser = { id: 'user-uuid-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      userRoles: ['system_admin'],
      user: mockUser,
    } as any);
  });

  // -------------------------------------------------------
  // 正常系：新規作成 → API 呼び出し → 管理者一覧へ遷移
  // -------------------------------------------------------
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
    fireEvent.change(screen.getByLabelText(/公開開始日/), {
      target: { value: '2026-02-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: '投稿する' }));

    await waitFor(() => {
      expect(announcementApi.createAnnouncement).toHaveBeenCalledWith({
        title: 'テストタイトル',
        content: 'テスト本文内容',
        publish_date: '2026-02-10',
        status: 'published',
        is_pinned: false,
        target_role: 'all',
        author_id: mockUser.id,
        end_date: null,
      });
    });

    // ★ 仕様変更：管理者一覧へ遷移
    expect(mockPush).toHaveBeenCalledWith('/announcements/admin');
  });

  // -------------------------------------------------------
  // 異常系：API 失敗 → エラー表示
  // -------------------------------------------------------
  it('APIが失敗したとき、エラーメッセージが表示されること', async () => {
    // 明示的に失敗のレスポンスを定義
    const errorMessage = 'サーバーエラーが発生しました';
    vi.mocked(announcementApi.createAnnouncement).mockResolvedValue({
      success: false,
      data: null as any,
      error: { message: errorMessage },
    });

    render(<NewAnnouncementPage />);

    // 必須入力項目を埋める（バリデーションによる送信阻止を防ぐため）
    fireEvent.change(screen.getByLabelText(/タイトル/), {
      target: { value: '失敗テスト' },
    });

    // 送信ボタンクリック
    const submitBtn = screen.getByRole('button', { name: '投稿する' });
    fireEvent.click(submitBtn);

    // エラーメッセージが表示されるのを待機
    // findByText はデフォルトで 1000ms 待つため、API呼び出し後の描画を拾えます
    const errorDisplay = await screen.findByText(errorMessage);
    expect(errorDisplay).toBeInTheDocument();

    // 遷移していないことも確認
    expect(mockPush).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // ガード：権限なし → 一般一覧へリダイレクト
  // -------------------------------------------------------
  it('管理者権限がない場合、一般一覧へリダイレクトされること', async () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      userRoles: ['general'],
      user: mockUser,
    } as any);

    render(<NewAnnouncementPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/announcements');
    });
  });
});
