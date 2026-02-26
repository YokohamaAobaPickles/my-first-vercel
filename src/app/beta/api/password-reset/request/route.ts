/**
 * Filename: src/app/api/password-reset/request/route.ts
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット要求（メール確認、トークン生成、メール送信）
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchMemberByEmail,
  saveResetToken,
} from '@/lib/memberApi'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const TOKEN_EXPIRY_MINUTES = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body?.email || '').trim()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスが必要です' },
        { status: 400 }
      )
    }

    const res = await fetchMemberByEmail(email)
    if (!res.success || !res.data) {
      return NextResponse.json({ success: true })
    }

    const member = res.data
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

    const saveRes = await saveResetToken(member.id, token, expiresAt)
    if (!saveRes.success) {
      return NextResponse.json(
        { success: false, error: saveRes.error?.message },
        { status: 500 }
      )
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl?.origin ||
      'http://localhost:3000'
    ).replace(/\/+$/, '')
    const resetUrl = `${baseUrl}/members/password-reset/change?token=${token}`

    const mailRes = await sendPasswordResetEmail(email, resetUrl)
    if (!mailRes.success) {
      return NextResponse.json(
        { success: false, error: mailRes.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('password-reset request error:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'エラーが発生しました' },
      { status: 500 }
    )
  }
}
