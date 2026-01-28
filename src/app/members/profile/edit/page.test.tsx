/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V1.2.0
 * Update  : 2026-01-28
 * 内容：
 * - ニックネーム重複チェック (checkNicknameExists) のバリデーションテスト追加
 * - Hooksの整合性チェック（Error #310回避後の実装を想定）
 * - 最新のラベル名（緊急連絡先電話番号等）に完全準拠
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// --- 型定義 ---
type MemberStatus = 'registration_request' | 'active' | 'suspend_req' | 
                   'suspended' | 'rejoin_req' | 'retire_req' | 
                   'retired' | 'rejected';

// @ts-ignore
import EditProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { updateMemberProfile, checkNicknameExists } from '@/lib/memberApi'
import { ROLES } from '@/types/member'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')
vi.mock('@/lib/memberApi', () => ({
  updateMemberProfile: vi.fn(),
  checkNicknameExists: vi.fn(),
}))

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('EditProfilePage - プロフィール編集画面の業務ルール検証 V1.2.0', () => {
  const TEST_USER = {
    id: 'user-123',
    email: 'test@example.com',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    nickname: 'たろう',
    member_number: '101',
    roles: 'general',
    gender: '男性',
    birthday: '1990-01-01',
    status: 'active' as MemberStatus,
    member_kind: '正会員',
    emg_tel: '090-9999-9999',
    emg_rel: '妻',
    emg_memo: '持病なし',
    postal: '100-0001',
    address: '東京都千代田区',
    tel: '03-1111-2222',
    profile_memo: 'よろしくお願いします',
    dupr_id: 'D-12345',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    // デフォルトの認証状態
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
    })

    // APIのデフォルト挙動（重複なし・保存成功）
    vi.mocked(checkNicknameExists).mockResolvedValue(false)
    vi.mocked(updateMemberProfile).mockResolvedValue({
      success: true,
      data: null,
      error: null
    })
  })

  it('【表示/権限】一般メンバーが編集できない項目が readOnly になっていること', () => {
    render(<EditProfilePage />)

    const readOnlyFields = [
      { label: '氏名', value: '山田 太郎' },
      { label: '氏名（ローマ字）', value: 'Taro Yamada' },
      { label: '性別', value: '男性' },
      { label: '生年月日', value: '1990-01-01' },
      { label: '会員番号', value: '101' },
      { label: 'ロール', value: 'general' },
    ]

    readOnlyFields.forEach(({ label, value }) => {
      const input = screen.getByLabelText(label)
      expect(input).toHaveValue(value)
      expect(input).toHaveAttribute('readOnly')
    })
  })

  it('【表示】編集可能項目の初期値が正しくセットされていること', () => {
    render(<EditProfilePage />)

    expect(screen.getByLabelText('ニックネーム')).toHaveValue('たろう')
    expect(screen.getByLabelText('郵便番号')).toHaveValue('100-0001')
    expect(screen.getByLabelText('住所')).toHaveValue('東京都千代田区')
    expect(screen.getByLabelText('電話番号')).toHaveValue('03-1111-2222')
    expect(screen.getByLabelText('緊急連絡先電話番号')).toHaveValue('090-9999-9999')
    expect(screen.getByLabelText('続柄')).toHaveValue('妻')
    expect(screen.getByLabelText('DUPR ID')).toHaveValue('D-12345')
  })

  it('【バリデーション】ニックネームが重複している場合は保存を中断すること', async () => {
    // ニックネームが既に存在していると仮定
    vi.mocked(checkNicknameExists).mockResolvedValue(true)
    
    render(<EditProfilePage />)
    
    const nicknameInput = screen.getByLabelText('ニックネーム')
    // 初期値の「たろう」から「重複太郎」に変更
    fireEvent.change(nicknameInput, { target: { value: '重複太郎' } })
    
    const saveButton = screen.getByRole('button', { name: /保存する/ })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      // 重複エラーのアラートが出ること
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('既に他のメンバーに使用されています')
      )
      // 保存APIが呼ばれていないこと
      expect(updateMemberProfile).not.toHaveBeenCalled()
    })
  })

  it('【正常系】保存ボタン押下で API が呼ばれ、プロフィール画面へ遷移すること', async () => {
    render(<EditProfilePage />)

    const nicknameInput = screen.getByLabelText('ニックネーム')
    fireEvent.change(nicknameInput, { target: { value: '新しいニックネーム' } })

    const saveBtn = screen.getByRole('button', { name: /保存する/ })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updateMemberProfile).toHaveBeenCalledWith(
        TEST_USER.id,
        expect.objectContaining({ nickname: '新しいニックネーム' })
      )
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

  it('【操作】キャンセルボタン押下で /members/profile に戻ること', () => {
    render(<EditProfilePage />)

    const cancelBtn = screen.getByRole('button', { name: /キャンセル/i })
    fireEvent.click(cancelBtn)

    expect(mockPush).toHaveBeenCalledWith('/members/profile')
  })
})