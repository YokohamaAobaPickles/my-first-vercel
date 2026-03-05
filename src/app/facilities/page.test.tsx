/**
 * Filename: src/app/facilities/page.test.tsx
 * Version: V1.1.3
 * Update: 2026-03-05
 * V1.1.3 - canManageFacilities に基づく「管理画面へ」ボタンの表示/非表示を検証するテストケースを追加
 * V1.1.2 - 表示項目を「施設名」と「電話番号」に絞ったテストに更新
 * V1.1.1 - 詳細ボタンの削除に伴い、施設名リンクのみを検証するようテストを修正
 * V1.1.0 - 一覧画面のシンプル化と詳細リンク追加のためのテスト
 * V1.0.0 - 施設一覧画面の基本的な表示と新規登録リンクのテスト
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import FacilitiesPage from '@/app/facilities/page';
import * as facilityHelpers from '@/utils/facilityHelpers';
import * as authUtils from '@/utils/auth';
import * as authHooks from '@/hooks/useAuthCheck';

// モック定義
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/utils/facilityHelpers');
vi.mock('@/utils/auth');
vi.mock('@/hooks/useAuthCheck');

const mockFacilities = [
  {
    id: 'facility-1',
    facility_name: 'テスト施設',
    phone: '03-1234-5678',
  },
];

describe('FacilitiesPage (一般向け施設一覧)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトでは一般ユーザー（権限なし）として振る舞う
    vi.mocked(authHooks.useAuthCheck).mockReturnValue({
      userRoles: ['general'],
      isLoading: false,
    } as any);
    vi.mocked(authUtils.canManageFacilities).mockReturnValue(false);
  });

  it('施設名と電話番号が表示されている', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);

    // 本体が 'use client' になるため、通常のコンポーネントとして render
    render(<FacilitiesPage />);

    expect(await screen.findByText('テスト施設')).toBeInTheDocument();
    expect(screen.getByText('03-1234-5678')).toBeInTheDocument();
  });

  it('施設名が詳細画面 /facilities/[id] へのリンクになっている', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);
    render(<FacilitiesPage />);

    const nameLink = await screen.findByRole('link', { name: 'テスト施設' });
    expect(nameLink).toHaveAttribute('href', '/facilities/facility-1');
  });

  it('一般ユーザーには「管理画面へ」ボタンが表示されないこと', async () => {
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);
    render(<FacilitiesPage />);

    expect(screen.queryByText('管理画面へ')).toBeNull();
    // かつて存在した「新規登録」ボタンも表示されないことを確認
    expect(screen.queryByText('新規登録')).toBeNull();
  });

  it('管理権限(admin等)がある場合、「管理画面へ」ボタンが表示されること', async () => {
    // 1. 管理者のロール設定
    vi.mocked(authHooks.useAuthCheck).mockReturnValue({
      userRoles: ['admin'],
      isLoading: false,
    } as any);
    // 2. 権限判定を true に
    vi.mocked(authUtils.canManageFacilities).mockReturnValue(true);
    vi.mocked(facilityHelpers.getFacilities).mockResolvedValue(mockFacilities as any);

    render(<FacilitiesPage />);

    const adminBtn = await screen.findByText('管理画面へ');
    expect(adminBtn).toBeInTheDocument();
    expect(adminBtn.closest('a')).toHaveAttribute('href', '/facilities/admin');
  });
});