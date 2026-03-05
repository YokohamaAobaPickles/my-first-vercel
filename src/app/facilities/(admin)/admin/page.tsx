/**
 * Filename: src/app/facilities/(admin)/admin/page.tsx
 * Version: V1.1.0
 * Update: 2026-03-05
 * Remarks: 各管理機能へのハブページ。ルーティング疎通確認用。
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { container, spacing } from '@/style/style_common'

export default function AdminHubPage() {
  const menuItems = [
    {
      title: '登録団体管理',
      path: '/facilities/groups',
      description: '登録団体の承認・編集・一覧確認',
      color: '#4ade80'
    },
    {
      title: '施設情報管理',
      path: '/facilities/shisetsu',
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
      <h2 style={{ color: '#fff', marginBottom: spacing.md }}>
        管理者メニュー（ハブ）
      </h2>
      
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
              textDecoration: 'none',
              transition: 'transform 0.2s'
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
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              {item.description}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        ※もし移動先が真っ白になる場合は、移動先の layout.tsx または page.tsx を確認してください。
      </div>
    </div>
  )
}