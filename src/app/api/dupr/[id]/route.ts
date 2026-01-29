/**
 * Filename: src/app/api/dupr/[id]/route.ts
 * Version : V1.0.2-debug
 * Update  : 2026-01-31
 * Remarks : デバッグ用：エラー詳細をフロントに返す
 */

import { NextResponse } from 'next/server';
import { fetchDuprInfo } from '@/lib/duprApi';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id === 'test') {
    return NextResponse.json({ message: "API is working", id });
  }

  const result = await fetchDuprInfo(id);

  if (!result.success) {
    // 404 ではなく 200 で、エラー内容をそのまま返す
    return NextResponse.json({
      debug: "fetchDuprInfo failed",
      originalResult: result
    });
  }

  return NextResponse.json(result);
}