/**
 * Filename: src/app/api/password-reset/change/route.ts
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット（トークン検証、有効期限チェック、パスワード更新）
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchMemberByResetToken,
  updatePasswordByResetToken,
} from '@/lib/memberApi'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const res = await fetchMemberByResetToken(token)
  if (!res.success || !res.data) {
    return NextResponse.json({ valid: false, error: '無効なトークンです' })
  }
  const member = res.data
  const expiresAt = member.reset_token_expires_at
  if (!expiresAt || new Date(expiresAt).getTime() < Date.now()) {
    return NextResponse.json({
      valid: false,
      error: 'トークンの有効期限が切れています',
    })
  }
  return NextResponse.json({ valid: true })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = (body?.token || '').trim()
    const newPassword = (body?.newPassword || '').trim()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'トークンと新しいパスワードが必要です' },
        { status: 400 }
      )
    }

    const res = await fetchMemberByResetToken(token)
    if (!res.success || !res.data) {
      return NextResponse.json(
        { success: false, error: '無効または期限切れのトークンです' },
        { status: 400 }
      )
    }

    const member = res.data
    const expiresAt = member.reset_token_expires_at

    if (!expiresAt) {
      return NextResponse.json(
        { success: false, error: '無効または期限切れのトークンです' },
        { status: 400 }
      )
    }

    const expiresAtDate = new Date(expiresAt)
    if (expiresAtDate.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'トークンの有効期限が切れています' },
        { status: 400 }
      )
    }

    const updateRes = await updatePasswordByResetToken(member.id, newPassword)
    if (!updateRes.success) {
      return NextResponse.json(
        { success: false, error: updateRes.error?.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('password-reset change error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
