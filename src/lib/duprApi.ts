/**
 * Filename: src/lib/duprApi.ts
 * Version : V1.1.1
 * Update  : 2026-01-31
 * Remarks : 
 * V1.1.1 - 修正：接続先を www.dupr.com に変更。解析ロジックの強化。
 * V1.1.0 - 修正：HTML解析による簡易取得方式に変更。
 */

import { ApiResponse } from '@/types/member';

/**
 * DUPR ID から公開プロフィールページを解析し、Rating 情報を取得する
 */
export const fetchDuprInfo = async (
  duprId: string
): Promise<ApiResponse<{ 
  dupr_rate_doubles: number; 
  dupr_rate_singles: number; 
}>> => {
  try {
    // 正しい公開プロフィールのURL
    const targetUrl = `https://www.dupr.com/u/${duprId}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: { 
          message: `ページが見つかりません (Status: ${response.status})` 
        }
      };
    }

    const html = await response.text();
    
    /**
     * DUPRのサイト構造に合わせた抽出
     * Doubles/Singles の数値の後に続くレーティングを抽出します。
     * 例: "doubles":4.522... などを探します。
     */
    const doublesMatch = html.match(/doubles["\s:]+([\d.]+)/i);
    const singlesMatch = html.match(/singles["\s:]+([\d.]+)/i);

    // デバッグ用に数値が取れなかった場合は 0.00 をセット
    const doubles = doublesMatch ? parseFloat(doublesMatch[1]) : 0.00;
    const singles = singlesMatch ? parseFloat(singlesMatch[1]) : 0.00;

    return {
      success: true,
      data: {
        dupr_rate_doubles: Number(doubles.toFixed(2)),
        dupr_rate_singles: Number(singles.toFixed(2)),
      }
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { message: 'DUPRデータの解析に失敗しました' }
    };
  }
};