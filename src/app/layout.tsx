/**
 * Filename: src/app/layout.tsx
 * Version : V1.0.0
 * Update  : 2026-02-26
 * Remarks :
 * V1.0.0 - Next.js App Router の全体レイアウト。
 *          旧デザインは適用せず、アプリ全体の最小構成のみ提供。
 *          V1 専用デザインは src/app/V1/layout.tsx に集約する。
 */

import type { ReactNode } from 'react'

export const metadata = {
  title: 'Yokohama Aoba Pickles Management System',
  description: 'V1 system',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
