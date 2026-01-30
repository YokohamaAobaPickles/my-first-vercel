/**
 * Filename: src/lib/duprApi.ts
 * Version : V1.3.0
 * Update  : 2026-01-31
 * Remarks : 
 * V1.3.0 - 修正：より広範なHTML構造に対応するため、正規表現を大幅に強化。
 * V1.2.4 - 修正：HTMLの改行・空白に対応するため正規表現を緩和。
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
     * 正規表現の強化：
     * "Doubles" という文字列の後、次の数値または "--" が現れるまで
     * のあらゆるタグと空白をスキップしてキャプチャします。
     * [^>]*> はタグの閉じを、[\\s\\S]*? は改行を含む最小一致を表します。
     */
    const extractRating = (type: string) => {
      const pattern = new RegExp(
        `${type}<\\/div>[\\s\\S]*?>([\\d.]+|--|NR)<`, 
        'i'
      );
      const match = html.match(pattern);
      if (
        !match || 
        match[1] === '--' || 
        match[1] === 'NR'
      ) {
        return 0;
      }
      return parseFloat(match[1]);
    };

    const doubles = extractRating('Doubles');
    const singles = extractRating('Singles');

    if (
      doubles === 0 && 
      singles === 0
    ) {
      return {
        success: false,
        data: null,
        error: { message: 'レーティングデータが未登録または見つかりません' }
      };
    }

    return {
      success: true,
      data: {
        dupr_rate_doubles: doubles,
        dupr_rate_singles: singles,
      },
      error: null
    };

  } catch (err) {
    return {
      success: false,
      data: null,
      error: { message: 'DUPR情報の取得中にエラーが発生しました' }
    };
  }
};