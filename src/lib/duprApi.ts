/**
 * Filename: src/lib/duprApi.ts
 * Version : V1.0.0
 * Update  : 2026-01-30
 * Remarks : 
 * V1.0.0 - 新規：DUPR 公開データ取得ロジックの実装。
 */

import { ApiResponse } from '@/types/member';

/**
 * DUPR ID から最新の Rating 情報を取得する
 */
export const fetchDuprInfo = async (
  duprId: string
): Promise<ApiResponse<{ 
  dupr_rate_doubles: number; 
  dupr_rate_singles: number; 
}>> => {
  try {
    // DUPR のパブリックAPIエンドポイント（一例）
    // ※ 実際の運用時は公式APIの仕様に準拠します
    const response = await fetch(
      `https://api.mydupr.com/player/public/v1/player/${duprId}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: { message: 'DUPR情報が見つかりませんでした' }
      };
    }

    const json = await response.json();
    const player = json.data;

    return {
      success: true,
      data: {
        dupr_rate_doubles: parseFloat(player.doubles) || 0,
        dupr_rate_singles: parseFloat(player.singles) || 0,
      }
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { message: 'DUPR通信エラーが発生しました' }
    };
  }
};