/**
 * Filename: src/lib/duprApi.ts
 * Version : V1.2.4
 * Update  : 2026-01-30
 * Remarks : 
 * V1.2.4 - 修正：HTMLの改行・空白に対応するため正規表現を緩和。
 * V1.2.3 - 修正：HTML構造解析を div タグ構成に対応。
 */

import { ApiResponse } from '@/types/member';

export const fetchDuprInfo = async (
  duprId: string
): Promise<ApiResponse<{
  dupr_rate_doubles: number;
  dupr_rate_singles: number;
}>> => {
  try {
    const targetUrl = `https://pickleball.com/players/${duprId}`;

    const response = await fetch(
      targetUrl, 
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store'
      }
    );

    if (
      !response.ok
    ) {
      return {
        success: false,
        data: null,
        error: {
          message: `プレイヤーが見つかりません (Status: ${response.status})`
        }
      };
    }

    const html = await response.text();

    /**
     * 正規表現の修正：
     * </div> と <div の間のあらゆる空白・改行 [\s\n]* を許容するように変更。
     */
    const doublesMatch = html.match(
      /Doubles<\/div>[\s\n]*<div[^>]*>([\d.]+|--)<\/div>/i
    );
    const singlesMatch = html.match(
      /Singles<\/div>[\s\n]*<div[^>]*>([\d.]+|--)<\/div>/i
    );

    const doubles = (
      doublesMatch && 
      doublesMatch[1] !== '--'
    ) ? parseFloat(doublesMatch[1]) : 0;

    const singles = (
      singlesMatch && 
      singlesMatch[1] !== '--'
    ) ? parseFloat(singlesMatch[1]) : 0;

    if (
      doubles === 0 &&
      singles === 0
    ) {
      return {
        success: false,
        data: null,
        error: { 
          message: 'レーティングデータが未登録または見つかりません' 
        }
      };
    }

    return {
      success: true,
      data: {
        dupr_rate_doubles: doubles,
        dupr_rate_singles: singles
      },
      error: null
    };

  } catch (err) {
    return {
      success: false,
      data: null,
      error: { 
        message: '通信エラーが発生しました' 
      }
    };
  }
};