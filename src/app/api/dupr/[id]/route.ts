/**
 * Filename: src/app/api/dupr/[id]/route.ts
 * Version : V1.0.2
 * Update  : 2026-01-31
 * Remarks : 
 * V1.0.2 - 修正：Dynamic Rendering を強制し、Vercel上での404を防止。
 * V1.0.1 - 修正：Next.js 15の非同期 params 仕様に対応。
 */

import { NextResponse } from 'next/server';
import { fetchDuprInfo } from '@/lib/duprApi';

/**
 * 追加：Next.js に対して、この API ルートを動的に生成することを強制します。
 */
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 15 では params は Promise なので await が必要
  const { id } = await params;

  if (
    !id
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { message: 'IDが指定されていません' }
      },
      { status: 400 }
    );
  }

  const result = await fetchDuprInfo(id);

  if (
    !result.success
  ) {
    // 404 エラーの場合も JSON でエラー内容を返す
    return NextResponse.json(
      result,
      { status: 404 }
    );
  }

  return NextResponse.json(
    result,
    { status: 200 }
  );
}