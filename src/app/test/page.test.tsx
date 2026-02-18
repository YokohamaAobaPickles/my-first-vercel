/**
 * Filename: src/app/assets/page.test.tsx
 * Version: V0.1.0
 * Update: 2026-02-13
 * Remarks: V0.1.0 - 資産・備品管理の画像表示テスト
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AssetsPage from './page';

describe('AssetsPage', () => {
  it('should render multiple images for asset preview', () => {
    render(<AssetsPage />);
    const images = screen.getAllByRole('img');
    // 3つの画像が表示されることを期待
    expect(images.length).toBeGreaterThanOrEqual(3);
  });
});