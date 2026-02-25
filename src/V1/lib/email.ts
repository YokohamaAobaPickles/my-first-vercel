/**
 * Filename: src/lib/email.ts
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : パスワードリセット用メール送信（Nodemailer + Gmail SMTP）
 */

import nodemailer from 'nodemailer'

const DEFAULT_FROM = 'yokohama.aoba.pickles@gmail.com'

/**
 * パスワードリセットメールを送信する
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> => {
  const user = process.env.GMAIL_USER || DEFAULT_FROM
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!pass) {
    console.error('GMAIL_APP_PASSWORD is not set')
    return { success: false, error: 'メール送信の設定がありません' }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  })

  const html = `
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>※このリンクは30分で失効します。</p>
<p>心当たりがない場合は、このメールを無視してください。</p>
`

  try {
    await transporter.sendMail({
      from: user,
      to,
      subject: '【YAPMS】パスワードリセット',
      text: `パスワードリセット用リンク: ${resetUrl}\nこのリンクは30分で失効します。`,
      html,
    })
    return { success: true }
  } catch (err: any) {
    console.error('sendPasswordResetEmail error:', err)
    return {
      success: false,
      error: err?.message || 'メール送信に失敗しました',
    }
  }
}
