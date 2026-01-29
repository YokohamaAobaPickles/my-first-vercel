/**
 * Filename: src/app/api/dupr/[id]/route.ts
 * Version : V1.0.0
 * Update  : 2026-01-30
 * Remarks : 
 * V1.0.0 - 新規：DUPR ID を受け取り情報を返す API エンドポイント。
 */

import { NextResponse } from 'next/server';
import { fetchDuprInfo } from '@/lib/duprApi';

/**
 * GET ハンドラー
 * フロントエンドからのリクエストを受け、サーバーサイドでDUPR情報を取得して返す
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // パラメータから ID を取得
  const id = params.id;

  // ID がない場合のバリデーション（通常ルーティングで弾かれるが念のため）
  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: { message: 'IDが指定されていません' } 
      },
      { status: 400 }
    );
  }

  // lib 側のロジックを呼び出し
  const result = await fetchDuprInfo(id);

  // 取得失敗（見つからない、エラー等）の場合
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  // 成功時
  return NextResponse.json(result);
}