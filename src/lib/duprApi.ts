/**
 * Filename: src/lib/duprApi.ts
 * Version : V1.2.1
 * Update  : 2026-01-31
 * Remarks : 
 * V1.2.1 - 変更：取得元を pickleball.com に変更し、解析ロジックを最適化。
 * V1.1.1 - 修正：接続先を www.dupr.com に変更。解析ロジックの強化。
 * V1.1.0 - 修正：HTML解析による簡易取得方式に変更。
 */

import { ApiResponse } from '@/types/member';

/**
 * DUPR情報を pickleball.com のプレイヤーページから解析・取得する
 * @param duprId ユーザーのスラッグ（例: "tomo-yamashita"）
 */
export const fetchDuprInfo = async (
  duprId: string
): Promise<ApiResponse<{
  dupr_rate_doubles: number;
  dupr_rate_singles: number;
}>> => {
  try {
    // データ取得元を pickleball.com に設定
    const targetUrl = `https://pickleball.com/players/${duprId}`;

    const response = await fetch(
      targetUrl, 
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
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
     * Pickleball.com の HTML 構造からレーティングを抽出
     * ラベルと数値の間の空白やタグを考慮した正規表現を使用
     */
/**
     * 提供されたHTML構造に基づき抽出：
     * > <div>Doubles</div><div ...>2.262</div>
     * 数値または "--" をキャプチャします。
     */
    const doublesMatch = html.match(
      /Doubles<\/div><div[^>]*>([\d.]+|--)<\/div>/i
    );
    const singlesMatch = html.match(
      /Singles<\/div><div[^>]*>([\d.]+|--)<\/div>/i
    );

    // 数値でない（--）場合は 0 を代入
    const doubles = (
      doublesMatch && 
      doublesMatch[1] !== '--'
    ) ? parseFloat(doublesMatch[1]) : 0;

    const singles = (
      singlesMatch && 
      singlesMatch[1] !== '--'
    ) ? parseFloat(singlesMatch[1]) : 0;

    // どちらかが取得できていれば成功とする
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