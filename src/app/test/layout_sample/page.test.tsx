/**
 * Filename: LayoutSample.test.tsx
 * Version: V0.1.0
 * Update: 2026-02-18
 * Remarks: V0.1.0 - レイアウトサンプルのレンダリングテスト（初期Fail確認用）
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LayoutSample from './page';

describe('LayoutSample', () => {
  it('画面タイトル「レイアウト確認用サンプル」が表示されていること', () => {
    render(<LayoutSample />);
    // 期待するFail: まだページを作成していない、あるいはタイトルが違う場合
    expect(screen.getByText('レイアウト確認用サンプル')).toBeInTheDocument();
  });
});