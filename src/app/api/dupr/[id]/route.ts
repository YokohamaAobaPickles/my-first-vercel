/**
 * Filename: src/app/api/dupr/[id]/route.ts
 * Version : V1.0.1
 * Update  : 2026-01-31
 * Remarks : 
 * V1.0.1 - 修正：Next.js 15の非同期 params 仕様に対応。
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
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 15 では params は Promise なので await が必要
  const { id } = await params;

  // ID がない場合のバリデーション
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
    return NextResponse.json(
      result, 
      { status: 404 }
    );
  }

  // 成功時
  return NextResponse.json(result);
}