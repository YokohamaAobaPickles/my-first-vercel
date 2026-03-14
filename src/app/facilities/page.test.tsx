/**
 * Filename: src/app/facilities/page.test.tsx
 * Version: V1.0.0
 * Update: 2026-03-13
 * Remarks: V1.0.0 - 施設管理ハブページの権限別レンダリングとリダイレクトのテスト
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FacilitiesHubPage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useRouter } from 'next/navigation'
import { canManageFacilities } from '@/utils/auth'

// モック定義
vi.mock('@/hooks/useAuthCheck')
vi.mock('next/navigation')
vi.mock('@/utils/auth')

describe('FacilitiesHubPage', () => {
  const pushMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: pushMock })
  })

  it('初期ロード中（isLoading: true）は何も表示されないこと', () => {
    ;(useAuthCheck as any).mockReturnValue({
      user: null,
      isLoading: true
    })

    const { container } = render(<FacilitiesHubPage />)
    expect(container.firstChild).toBeNull()
  })

  it('管理権限がない場合、施設一覧(/facilities/info)へリダイレクトされること', 
  async () => {
    // 一般ユーザー（管理権限なし）の設定
    ;(useAuthCheck as any).mockReturnValue({
      user: { roles: ['general'] },
      isLoading: false
    })
    ;(canManageFacilities as any).mockReturnValue(false)

    render(<FacilitiesHubPage />)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/facilities/info')
    })
  })

  it('管理権限がある場合、管理メニューが表示されること', () => {
    // 管理者（System Admin等）の設定
    ;(useAuthCheck as any).mockReturnValue({
      user: { roles: ['system_admin'] },
      isLoading: false
    })
    ;(canManageFacilities as any).mockReturnValue(true)

    render(<FacilitiesHubPage />)

    // メニュータイトルの確認
    expect(screen.getByText('施設管理メニュー')).toBeDefined()
    
    // 各リンク先が正しく表示されているか確認
    expect(screen.getByText('登録団体管理')).toBeDefined()
    expect(screen.getByText('施設情報管理')).toBeDefined()
    expect(screen.getByText('予約状況管理')).toBeDefined()
    
    // リダイレクトが呼ばれていないことを確認
    expect(pushMock).not.toHaveBeenCalled()
  })
})