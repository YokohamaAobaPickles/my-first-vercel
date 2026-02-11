/**
 * Filename: src/app/components/BottomNavigation.test.tsx
 * Version : V1.2.2
 * Update  : 2026-02-11
 * Remarks : 
 * V1.2.2 - DOM検証用のマッチャーをインポート
 * V1.2.1 - SVGアイコン対応。アクティブ色の検証を強化。
 * V1.1.0 - アクティブ状態のテスト強化、アイコンのアクティブ確認を追加
 * V1.0.0 - 新規作成。BottomNavigationのユニットテスト。
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BottomNavigation from './BottomNavigation';
import { usePathname } from 'next/navigation';

// Next.js の usePathname をモック化
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('BottomNavigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    // テキスト(aタグ)の色検証
    expect(activeItem).toHaveStyle({ color: '#00D1FF' });

    // SVGの色検証（本体で style={{ color: ... }} を付与する前提）
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
