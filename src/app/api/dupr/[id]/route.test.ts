/**
 * Filename: src/app/api/dupr/[id]/route.test.ts
 * Version : V1.1.1
 * Update  : 2026-01-31
 * Remarks : 
 * V1.1.1 - 修正：Next.js 15の非同期 params 仕様に合わせたテストデータ修正。
 * V1.1.0 - 修正：fetchを使わず、GET関数を直接呼び出す単体テストに変更。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { ApiResponse } from '@/types/member';

// lib/duprApi の fetchDuprInfo をモック化
vi.mock('@/lib/duprApi', () => ({
  fetchDuprInfo: vi.fn(),
}));

import { fetchDuprInfo } from '@/lib/duprApi';

describe('DUPR API Route Handler Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('【正常系】有効なIDの場合、200 OK とデータを返すこと', async () => {
    // 1. モックの準備
    const mockSuccessResponse: ApiResponse<{ 
      dupr_rate_doubles: number; 
      dupr_rate_singles: number; 
    }> = {
      success: true,
      data: {
        dupr_rate_doubles: 4.52,
        dupr_rate_singles: 4.10,
      },
    };
    
    vi.mocked(fetchDuprInfo).mockResolvedValue(mockSuccessResponse);

    // 2. リクエストの準備
    const req = new Request('http://localhost:3000/api/dupr/WKRV2Q');
    // params を Promise.resolve でラップして渡す
    const context = { 
      params: Promise.resolve({ id: 'WKRV2Q' }) 
    };

    // 3. ハンドラーの実行
    const response = await GET(req, context);
    const json = await response.json();

    // 4. 検証
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.dupr_rate_doubles).toBe(4.52);
    expect(fetchDuprInfo).toHaveBeenCalledWith('WKRV2Q');
  });

  it('【準正常系】IDが見つからない場合、404 Not Found を返すこと', async () => {
    // 1. モックの準備
    const mockErrorResponse: ApiResponse<any> = {
      success: false,
      data: null,
      error: { message: 'DUPR情報が見つかりませんでした' },
    };
    vi.mocked(fetchDuprInfo).mockResolvedValue(mockErrorResponse);

    // 2. リクエスト
    const req = new Request('http://localhost:3000/api/dupr/INVALID');
    const context = { 
      params: Promise.resolve({ id: 'INVALID' }) 
    };

    // 3. 実行
    const response = await GET(req, context);
    const json = await response.json();

    // 4. 検証
    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.message).toBe('DUPR情報が見つかりませんでした');
  });

  it('【異常系】IDが指定されていない場合、400 Bad Request を返すこと', async () => {
    // 空文字のIDが渡されたケースを想定
    const req = new Request('http://localhost:3000/api/dupr/');
    const context = { 
      params: Promise.resolve({ id: '' }) 
    };

    const response = await GET(req, context);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});