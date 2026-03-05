/**
 * Filename: src/app/facilities/(admin)/admin/layout.tsx
 * Version: V1.0.2
 * Update: 2026-03-05
 * Remarks: 
 * V1.0.1 - TypeScriptのエラー(TS2559)を修正。styleの割り当てを正当化
 * V1.0.0 - 管理者用共通レイアウト（タブナビゲーション）を新規作成
 */

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { container, spacing } from '@/style/style_common' // spacingを追加
import {
  adminTabContainer,
  adminTab,
  adminTabActive,
} from '@/style/style_facility'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // 権限チェック
  const { isLoading, userRoles } = useAuthCheck()

  // デバッグ用ログ
  console.log('AdminLayout Status:', { isLoading, userRoles })

  useEffect(() => {
    // デバッグのため、一旦リダイレクト処理をコメントアウトして
    // 画面が表示されるか確認してください。
    /*
    if (!isLoading) {
      const isAdmin = userRoles?.includes('admin') || 
                      userRoles?.includes('system_admin') ||
                      userRoles?.includes('president') ||
                      userRoles?.includes('vice_president')
      if (!isAdmin) {
        router.push('/facilities')
      }
    }
    */
  }, [isLoading, userRoles, router])

  // アクティブなタブを判定
const isActive = (path: string) => {
    if (path === '/facilities/admin') {
      return (
        pathname === '/facilities/admin' ||
        pathname.startsWith('/facilities/admin/new') ||
        pathname.startsWith('/facilities/admin/edit')
      )
    }
    return pathname.startsWith(path)
  }

  // 1. ローディング中の表示を派手にして確認
  if (isLoading) {
    return (
      <div style={{ ...container, color: 'orange', fontSize: '24px' }}>
        【AdminLayout】認証確認中...
      </div>
    )
  }

  // 2. 権限がない場合に「真っ白」ではなく理由を表示
  const isAdmin = userRoles?.includes('admin') || 
                  userRoles?.includes('system_admin') ||
                  userRoles?.includes('president') ||
                  userRoles?.includes('vice_president')

  if (!isAdmin) {
    return (
      <div style={{ ...container, border: '5px solid red', padding: '20px' }}>
        <h2 style={{ color: 'red' }}>権限エラー</h2>
        <p>現在のロール: {JSON.stringify(userRoles)}</p>
        <p>管理者権限がないため、表示をブロックしています。</p>
        <Link href="/facilities">施設一覧に戻る</Link>
      </div>
    )
  }

  return (
    <div style={container}>
      <nav style={adminTabContainer}>
        <Link
          href="/facilities/admin"
          style={{
            ...adminTab,
            ...(isActive('/facilities/admin') ? adminTabActive : {}),
          }}
        >
          施設管理
        </Link>
        <Link
          href="/facilities/admin/groups"
          style={{
            ...adminTab,
            ...(isActive('/facilities/admin/groups') ? adminTabActive : {}),
          }}
        >
          団体管理
        </Link>
        <Link
          href="/facilities/admin/reservations"
          style={{
            ...adminTab,
            ...(isActive('/facilities/admin/reservations') ? adminTabActive : {}),
          }}
        >
          予約管理
        </Link>
      </nav>

      <main style={{ marginTop: spacing.md }}>
        {children}
      </main>
    </div>
  )
}