/**
 * Filename: src/lib/duprApi.test.ts
 * Version : V1.1.0
 * Update  : 2026-01-31
 * Remarks : 
 * V1.1.0 - 修正：実際の複雑なHTML構造（改行・空白・入れ子）を模したテストに変更。
 */

import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest';
import { fetchDuprInfo } from './duprApi';

global.fetch = vi.fn();

describe('duprApi - fetchDuprInfo Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('【正常系】複雑なHTMLからレーティングを取得できること', async () => {
    // 実際のサイトに近い、改行や深い階層を持つHTML
    const mockHtml = `
      <div class="rating-card">
        <div>Doubles</div>
        <div class="xyz">
          <span>2.262</span>
        </div>
      </div>
      <div class="rating-card">
        <div>Singles</div>
        <div>
          <span>NR</span>
        </div>
      </div>
    `;
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => mockHtml,
    } as Response);

    const result = await fetchDuprInfo('tomo-yamashita');

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      // 2.262 が正しく抽出されることを期待
      expect(result.data.dupr_rate_doubles).toBe(2.262);
      // NR（--相当）は 0 と判定されることを期待
      expect(result.data.dupr_rate_singles).toBe(0);
    }
  });

  it('【準正常系】プレイヤーが見つからない場合に失敗を返すこと', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const result = await fetchDuprInfo('invalid-id');
    expect(result.success).toBe(false);
  });
});