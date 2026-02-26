/**
 * Filename: layout.tsx
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks :
 * V1.0.0 - V1共通レイアウト（Container / Content / BottomNavigation）
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  container,
  getContentStyle,
} from '@v1/style/style_common'
import { bottomNav } from '@v1/style/style_bottomnav'

const V1_BASE = '/V1/app'

const navItems: { path: string; label: string }[] = [
  { path: `${V1_BASE}/announcement`, label: 'お知らせ' },
  { path: `${V1_BASE}/event`, label: 'イベント' },
  { path: `${V1_BASE}/accounting`, label: '会計' },
  { path: `${V1_BASE}/support`, label: 'サポート' },
  { path: `${V1_BASE}/member/profile`, label: '会員' },
]

export default function V1Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [width, setWidth] = useState(1024)

  useEffect(() => {
    setWidth(window.innerWidth)
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const contentStyle = getContentStyle(width)
  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <div style={container}>
      <div style={contentStyle}>{children}</div>
      <nav style={bottomNav.container} aria-label="メインナビゲーション">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            style={
              isActive(path)
                ? { ...bottomNav.item, ...bottomNav.itemActive }
                : bottomNav.item
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
