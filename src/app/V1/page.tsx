/**
 * Filename: src/app/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-25
 * 修正内容：
 * V1.0.0
 * - ルートページを「案内係（Router）」に特化。
 * - LINEコンテキストとPCブラウザコンテキストを明示的に分離して判定。
 * - テストコード(page.test.tsx)のCase 1〜4の仕様を厳密に実装。
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading, currentLineId } = useAuthCheck()

  useEffect(() => {
    // 認証情報の読み込み完了を待機
    if (isLoading) return

    if (currentLineId) {
      // --- LINEアプリからのアクセス ---
      if (user) {
        // Case 2: LINEリピート（登録済み）
        router.replace('/V1/app/member/profile')
      } else {
        // Case 1: LINE初回（未登録）
        router.replace('/V1/app/login')
      }
    } else {
      // --- PC/標準ブラウザからのアクセス ---
      if (user) {
        // Case 4: ブラウザログイン済み
        router.replace('/V1/app/member/profile')
      } else {
        // Case 3: ブラウザ未ログイン
        router.replace('/V1/app/login')
      }
    }
  }, [user, isLoading, currentLineId, router])

  // リダイレクトまでの待機画面（黒背景でチラつきを防止）
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }} />
  )
}