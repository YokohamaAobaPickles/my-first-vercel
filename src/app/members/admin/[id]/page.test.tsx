/**
 * Filename: src/app/members/admin/[id]/page.test.tsx
 * Version : V1.3.3
 * Update  : 2026-01-26
 * * 履歴：
 * V1.3.3 - 完全にファイルをリセットし、旧バージョン(V1.3.0等)との衝突を解消。
 * すべてのモック呼び出しにセミコロンを付与し、解釈エラーを防止。
 * V1.3.0 - memberApi モック化対応。
 * V1.1.0 - 承認アクションの検証追加。
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MemberDetailPage from './page';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { ROLES } from '@/utils/auth';
import * as memberApi from '@/lib/memberApi';

// 1. モックの定義
vi.mock('@/hooks/useAuthCheck');
vi.mock('@/lib/memberApi', () => ({
  fetchMemberById: vi.fn(),
  updateMemberStatus: vi.fn(),
}));

const mockReplace = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
  useParams: () => ({
    id: 'test-user-123',
  }),
}));

// 2. テストスイート（これ一つだけに絞ります）
describe('MemberDetailPage - V1.3.3 最終確定テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it('【表示】APIから取得した名前が画面に表示されること', async () => {
    // セミコロンを末尾に置くことで、次の行との結合を防ぎます
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
    });

    (memberApi.fetchMemberById as any).mockResolvedValue({
      id: 'test-user-123',
      name: '本物のテスト次郎',
      status: 'registration_request',
      member_kind: '正会員',
    });

    render(<MemberDetailPage />);

    // findByText は非同期で要素が現れるのを待ちます
    const element = await screen.findByText(/本物のテスト次郎/);
    expect(element).toBeTruthy();
  });

  it('【操作】承認ボタンをクリックするとAPIが呼ばれ、一覧へ遷移すること', async () => {
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: ROLES.SYSTEM_ADMIN },
    });

    (memberApi.fetchMemberById as any).mockResolvedValue({
      id: 'test-user-123',
      name: 'テスト次郎',
      status: 'registration_request',
    });

    (memberApi.updateMemberStatus as any).mockResolvedValue({ 
      success: true 
    });

    // ダイアログを自動で「OK」にする
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MemberDetailPage />);
    
    const btn = await screen.findByRole('button', { name: /承認する/ });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(memberApi.updateMemberStatus).toHaveBeenCalledWith(
        'test-user-123', 
        'active'
      );
      expect(mockReplace).toHaveBeenCalledWith('/members/admin');
    });
  });

  it('【ガード】権限がない場合はトップページへ戻されること', async () => {
    (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: { roles: '一般' },
    });

    render(<MemberDetailPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});