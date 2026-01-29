/**
 * Filename: src/app/api/dupr/[id]/route.test.ts
 * Version : V1.1.0
 * Update  : 2026-01-30
 * Remarks : 
 * V1.1.0 - 修正：fetchを使わず、GET関数を直接呼び出して単体テストを行う形に変更。
 * V1.0.0 - 新規作成。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route'; // 作成したハンドラーを直接インポート
import { ApiResponse } from '@/types/member';

// lib/duprApi の fetchDuprInfo をモック化します
// これにより、実際の外部通信を行わずにルートの挙動だけをテストできます
vi.mock('@/lib/duprApi', () => ({
  fetchDuprInfo: vi.fn(),
}));

import { fetchDuprInfo } from '@/lib/duprApi';

describe('DUPR API Route Handler Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('【正常系】有効なIDの場合、200 OK とデータを返すこと', async () => {
    // 1. モックの準備：成功レスポンスを定義
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
    
    // fetchDuprInfo が呼ばれたら上記を返すように設定
    vi.mocked(fetchDuprInfo).mockResolvedValue(mockSuccessResponse);

    // 2. リクエストの準備（GET関数に渡す引数）
    const req = new Request('http://localhost:3000/api/dupr/WKRV2Q');
    const params = { params: { id: 'WKRV2Q' } };

    // 3. ハンドラーの実行
    const response = await GET(req, params);
    const json = await response.json();

    // 4. 検証
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.dupr_rate_doubles).toBe(4.52);
    // 実際に fetchDuprInfo が正しい引数で呼ばれたかもチェック
    expect(fetchDuprInfo).toHaveBeenCalledWith('WKRV2Q');
  });

  it('【準正常系】IDが見つからない場合、404 Not Found を返すこと', async () => {
    // 1. モックの準備：失敗レスポンス
    const mockErrorResponse: ApiResponse<any> = {
      success: false,
      data: null,
      error: { message: 'DUPR情報が見つかりませんでした' },
    };
    vi.mocked(fetchDuprInfo).mockResolvedValue(mockErrorResponse);

    // 2. リクエスト
    const req = new Request('http://localhost:3000/api/dupr/INVALID');
    const params = { params: { id: 'INVALID' } };

    // 3. 実行
    const response = await GET(req, params);
    const json = await response.json();

    // 4. 検証
    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.message).toBe('DUPR情報が見つかりませんでした');
  });

  it('【異常系】IDが指定されていない場合、400 Bad Request を返すこと', async () => {
    // 空文字のIDが渡されたケースを想定
    const req = new Request('http://localhost:3000/api/dupr/');
    const params = { params: { id: '' } };

    const response = await GET(req, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});