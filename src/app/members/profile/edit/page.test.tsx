/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V1.1.1
 * Update  : 2026-01-27
 * 内容：
 * - VS Code のインポートエラーを解消 (ts-ignore の再追加)
 * - MemberStatus 型の定義を追加し、TSを安定化
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// --- 型定義 (実装からインポートできない場合に備えて定義) ---
type MemberStatus = 'registration_request' | 'active' | 'suspend_req' | 'suspended' | 'rejoin_req' | 'retire_req' | 'retired' | 'rejected';

// @ts-ignore: 実装側の page.tsx が型的に不完全な場合のエラーを無視
import EditProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'

import { updateMemberProfile } from '@/lib/memberApi'
import {
  Member,
  ROLES
} from '@/types/member'

// --- モック設定 ---
vi.mock('@/hooks/useAuthCheck')

// 【修正ポイント】自動モックではなく、明示的に関数を定義します
vi.mock('@/lib/memberApi', () => ({
  updateMemberProfile: vi.fn(),
  checkNicknameExists: vi.fn(), // コンポーネントでインポートされているため定義が必要
}))

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('EditProfilePage - プロフィール編集画面の業務ルール検証 V1.1.1', () => {
  // 最新スキーマに基づくテストデータ
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
      ; (useAuthCheck as any).mockReturnValue({
        isLoading: false,
        user: TEST_USER,
        userRoles: 'general',
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

    // 正しいラベル名での検証
    expect(screen.getByLabelText('緊急連絡先電話番号')).toHaveValue('090-9999-9999')
    expect(screen.getByLabelText('続柄')).toHaveValue('妻')
  })

  it('【操作】キャンセルボタン押下で /members/profile に戻ること', () => {
    render(<EditProfilePage />)

    const cancelBtn = screen.getByRole('button', { name: /キャンセル/i })
    fireEvent.click(cancelBtn)

    expect(mockPush).toHaveBeenCalledWith('/members/profile')
  })

  it('【表示】競技情報(DUPR ID)の初期値がセットされていること', () => {
    render(<EditProfilePage />)
    expect(screen.getByLabelText('DUPR ID')).toHaveValue('D-12345')
  })

  it('【正常系】保存ボタン押下で API が呼ばれ、プロフィール画面へ遷移すること', async () => {
    // API成功時のレスポンスをモック
    vi.mocked(updateMemberProfile).mockResolvedValue({
      success: true,
      data: null,
      error: null
    })

    render(<EditProfilePage />)

    // 値を変更してみる
    const nicknameInput = screen.getByLabelText(/ニックネーム/)
    fireEvent.change(nicknameInput, { target: { value: '新しいニックネーム' } })

    const saveBtn = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      // 1. APIが正しい引数で呼ばれたか
      // (TEST_USER.id と、変更後のデータが含まれているか)
      expect(updateMemberProfile).toHaveBeenCalledWith(
        TEST_USER.id,
        expect.objectContaining({ nickname: '新しいニックネーム' })
      )
      // 2. 成功後にプロフィール画面に戻ったか
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

})