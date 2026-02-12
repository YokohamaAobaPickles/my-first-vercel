/**
 * Filename: src/app/components/BottomNavigation.test.tsx
 * Version : V1.3.0
 * Update  : 2026-02-12
 * Remarks :
 * V1.3.0 - useAuthCheck をモックし、ログイン済み状態を再現するよう修正
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BottomNavigation from './BottomNavigation';
import { usePathname } from 'next/navigation';
import { useAuthCheck } from '@/hooks/useAuthCheck';

// --- モック ---
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('@/hooks/useAuthCheck', () => ({
  useAuthCheck: vi.fn(),
}));

describe('BottomNavigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ★ ここが最重要：ログイン済み状態を再現
    (useAuthCheck as any).mockReturnValue({
      user: { id: 'test-user' },
      isLoading: false,
    });
  });

  it('ログイン前であればメニューが表示されないこと', () => {
    (useAuthCheck as any).mockReturnValue({
      user: null,
      isLoading: false,
    });

    (usePathname as any).mockReturnValue('/');

    render(<BottomNavigation />);

    const labels = ['お知らせ', 'イベント', '会計', '資産', 'マイページ'];
    labels.forEach(label => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
  });

  it('すべてのメニュー項目が正しくレンダリングされること', () => {
    (usePathname as any).mockReturnValue('/');
    render(<BottomNavigation />);

    const labels = ['お知らせ', 'イベント', '会計', '資産', 'マイページ'];
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('現在のパスに応じてアクティブスタイルが適用されること', () => {
    (usePathname as any).mockReturnValue('/announcements');
    render(<BottomNavigation />);

    const activeItem = screen.getByText('お知らせ').closest('a');
    expect(activeItem).toHaveStyle({ color: '#00D1FF' });

    const icon = activeItem?.querySelector('svg');
    expect(icon).toHaveStyle({ color: '#00D1FF' });
  });

  it('各項目が正しいリンク先（href）を持っていること', () => {
    (usePathname as any).mockReturnValue('/');
    render(<BottomNavigation />);

    const links = [
      { label: 'お知らせ', href: '/announcements' },
      { label: 'マイページ', href: '/members/profile' },
    ];

    links.forEach(({ label, href }) => {
      expect(screen.getByText(label).closest('a')).toHaveAttribute('href', href);
    });
  });
});
