/**
 * Filename: src/lib/duprApi.test.ts
 * Version : V1.0.0
 * Update  : 2026-01-31
 * Remarks : 
 * V1.0.0 - 新規作成：duprApi の単体テストコード。
 */

import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest';
import { fetchDuprInfo } from './duprApi';

// グローバルの fetch をモック化します
global.fetch = vi.fn();

describe('duprApi - fetchDuprInfo Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('【正常系】公開ページからレーティングを取得できること', async () => {
    // 公開プロフィールのHTMLを模したレスポンス
    const mockHtml = '<html><body>DUPR Profile Page</body></html>';
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockHtml,
    } as Response);

    const result = await fetchDuprInfo('WKRV2Q');

    // 期待される挙動：成功フラグが立っており、数値データが含まれている
    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(typeof result.data.dupr_rate_doubles).toBe('number');
      expect(typeof result.data.dupr_rate_singles).toBe('number');
    }
  });

  it('【準正常系】ページが存在しない(404)場合に適切なエラーを返すこと', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const result = await fetchDuprInfo('NOT_FOUND_ID');

    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.message).toContain('ページが見つかりません');
    }
  });

  it('【異常系】通信エラー時に解析失敗エラーを返すこと', async () => {
    // fetch 自体が例外を投げるケース
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const result = await fetchDuprInfo('WKRV2Q');

    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.message).toBe('DUPRデータの解析に失敗しました');
    }
  });
});