/**
 * Filename: src/app/members/profile/page.test.tsx
 * Version : V1.5.1
 * Update  : 2026-01-27
 * 内容：
 * V1.5.1
 * - useAuthCheck の戻り値に userRoles を追加（auth.ts V1.5.0 適合）
 * - ユーザーオブジェクトのプロパティを roles -> role に修正
 * V1.5.0
 * - 新セクション項目（性別、生年月日、DUPR、緊急連絡先、在籍日数）の表示テストを追加
 * - プロフィールセクション内の「編集」ボタンの存在確認を追加
 * V1.4.4
 * - 管理者権限による管理パネル表示の検証
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { Member, ROLES } from '@/types/member'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ProfilePage - 表示と遷移の検証 V2.1.0', () => {
  const TEST_LINE_ID = 'U_TEST_123'

  const TEST_USER: Member = {
    id: 'user-123',
    email: 'test@example.com',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    nickname: 'たろう',
    status: 'active',
    roles: 'general',
    line_id: TEST_LINE_ID,
    create_date: '2025-01-01T00:00:00Z',
    gender: '男性',
    birthday: '1990-01-01',
    member_number: '101',
    member_kind: '正会員',
    tel: '03-1234-5678',
    postal: '100-0001',
    address: '東京都千代田区',
    emg_tel: '03-9999-8888', // expectと一致させる
    emg_rel: '父',           // expectと一致させる
    emg_memo: '持病なし',    // expectと一致させる
    dupr_id: 'D-123',
    dupr_rate: 3.555         // expectと一致させる
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('【権限】管理者の場合、最上部に管理パネルへのリンクが表示されること', async () => {
    // 会員管理担当者のロールを設定
    const adminRole = ROLES.MEMBER_MANAGER
      ; (useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: { ...TEST_USER, role: adminRole },
        userRoles: adminRole, // ProfilePage が参照する値をシミュレート
        currentLineId: TEST_LINE_ID,
      })
    render(<ProfilePage />)
    expect(screen.getByText(/会員管理パネル/)).toBeTruthy()
  })

  it('【機能】プロフィールセクションに編集ボタンが表示されること', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    // getByRole で確実にボタンを特定
    expect(screen.getByRole('button', { name: /編集/ })).toBeTruthy()
  })

  it('【操作】編集ボタンをクリックすると編集ページへ遷移すること', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })

    render(<ProfilePage />)

    const editBtn = screen.getByRole('button', {
      name: /編集/
    })

    // ボタン押下
    fireEvent.click(editBtn)

    // router.push が期待するパスで呼ばれたか
    expect(mockPush).toHaveBeenCalledWith('/members/profile/edit')
  })

  it('【表示】基本情報セクションの項目が正しく表示されること', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/山田 太郎/)).toBeTruthy()
    expect(screen.getByText(/男性/)).toBeTruthy()
    expect(screen.getByText(/1990-01-01/)).toBeTruthy()
    // status: 'active' が 「有効」 と表示されているか
    expect(screen.getByText('有効')).toBeTruthy()
    expect(screen.getByText(/日目/)).toBeTruthy()
  })

  it('【表示】競技情報セクション(DUPR)が正しく表示されること', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/D-123/)).toBeTruthy()
    expect(screen.getByText(/3.555/)).toBeTruthy()
  })

  it('【表示】緊急連絡先セクションが正しく表示されること', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/03-9999-8888/)).toBeTruthy()
    expect(screen.getByText(/父/)).toBeTruthy()
    expect(screen.getByText(/持病なし/)).toBeTruthy()
  })

  it('【権限】一般ユーザーの場合、管理パネルへのリンクが表示されないこと', async () => {
    ; (useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
      userRoles: 'general',
      currentLineId: TEST_LINE_ID,
    })
    render(<ProfilePage />)
    expect(screen.queryByText(/会員管理パネル/)).toBeNull()
  })
})