/**
 * Filename: src/app/facilities/(admin)/admin/layout.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-05
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLayout from './layout';
import { useAuthCheck } from '@/hooks/useAuthCheck';

// モック設定
vi.mock('@/hooks/useAuthCheck');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/facilities/admin',
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ローディング中は「認証確認中...」が表示されること', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: true,
      userRoles: null,
      user: null
    } as any);

    render(<AdminLayout><div>Content</div></AdminLayout>);
    
    // これが失敗するなら、isLoading時のレンダリング自体が壊れています
    expect(screen.getByText(/認証確認中/)).toBeInTheDocument();
  });

  it('管理者権限がある場合、タブメニューが表示されること', () => {
    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      userRoles: ['admin'],
      user: { id: '1' }
    } as any);

    render(<AdminLayout><div>Test Content</div></AdminLayout>);

    // これが成功するのにブラウザが真っ白なら、CSSで消えている可能性が高いです
    expect(screen.getByText('施設管理')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});