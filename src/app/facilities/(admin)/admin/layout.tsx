/**
 * Filename: src/app/facilities/(admin)/admin/layout.tsx
 * Version: V1.0.4
 * Update: 2026-03-05
 * Remarks: スタイル干渉を回避するため、インラインスタイルで強制的にコンテンツを表示。
 */

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, userRoles } = useAuthCheck()

  useEffect(() => {
    if (!isLoading) {
      const isAdmin = userRoles?.includes('admin') || 
                      userRoles?.includes('system_admin') ||
                      userRoles?.includes('president') ||
                      userRoles?.includes('vice_president')
      if (!isAdmin) {
        router.push('/facilities')
      }
    }
  }, [isLoading, userRoles, router])

  if (isLoading) {
    return (
      <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>
        認証確認中...
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 50,           // ボトムナビより前面に出す
      padding: '20px', 
      minHeight: '80vh',    // 高さを確保
      color: '#ffffff' 
    }}>
      {/* 簡易タブメニュー */}
      <nav style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '1px solid #555',
        paddingBottom: '10px'
      }}>
        <Link href="/facilities/admin" style={{ color: pathname === '/facilities/admin' ? '#4ade80' : '#fff' }}>
          施設管理
        </Link>
        <Link href="/facilities/admin/groups" style={{ color: '#fff' }}>
          団体管理
        </Link>
        <Link href="/facilities/admin/reservations" style={{ color: '#fff' }}>
          予約管理
        </Link>
      </nav>

      <main style={{ paddingBottom: '100px' }}> {/* 下部メニューとの被り防止 */}
        {children}
      </main>
    </div>
  )
}