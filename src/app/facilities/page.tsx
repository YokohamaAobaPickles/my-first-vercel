/**
 * Filename: src/app/facilities/page.tsx
 * Version: V1.2.1
 * Update: 2026-03-13
 * Remarks: V1.2.1 - useAuthCheck の isLoading に対応、権限判定の精度向上
 */

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageFacilities } from '@/utils/auth'
import { container, spacing } from '@/style/style_common'
import { baseStyles } from '@/types/styles/style_common'

export default function FacilitiesHubPage() {
  const { user, isLoading } = useAuthCheck()
  const router = useRouter()

  // 権限判定：管理者（System Admin, 会長, 副会長）であるか確認
  const isManager = canManageFacilities(user?.roles)

  useEffect(() => {
    // 認証チェックが完了し、かつ管理権限がない場合は一般利用者向け一覧へ
    if (!isLoading && !isManager) {
      router.push('/facilities/info')
    }
  }, [isManager, isLoading, router])

  // ローディング中、またはリダイレクト対象者は何も表示しない
  if (isLoading || !isManager) {
    return null
  }

  const menuItems = [
    {
      title: '登録団体管理',
      path: '/facilities/groups',
      description: '登録団体の承認・編集・一覧確認',
      color: '#4ade80'
    },
    {
      title: '施設情報管理',
      path: '/facilities/info',
      description: '施設情報の新規登録・編集',
      color: '#60a5fa'
    },
    {
      title: '予約状況管理',
      path: '/facilities/reservations',
      description: '予約の確認・キャンセル・ステータス変更',
      color: '#f87171'
    }
  ]

  return (
    <div style={{ ...container, padding: '20px' }}>
      {/*
      <h2 style={{ 
        color: '#fff', 
        marginBottom: spacing.md 
      }}>
      </h2>
      */}
      <h1 style={{ ...baseStyles.headerTitle, marginBottom: 0 }}>
        施設管理メニュー
      </h1>
      <div style={{
        display: 'grid',
        gap: '15px',
        gridTemplateColumns: '1fr'
      }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: 'block',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${item.color}`,
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: item.color,
              marginBottom: '5px'
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#ccc'
            }}>
              {item.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}