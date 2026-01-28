/**
 * Filename: src/app/members/profile/edit/page.test.tsx
 * Version : V1.2.3
 * Update  : 2026-01-29
 * Remarks : 
 * V1.2.3 - 改善：型定義を src/types/member.ts からのインポートに変更。
 * V1.2.3 - 修正：本体ラベル「氏名」「電話番号」の重複によるテスト失敗を解消。
 * V1.2.3 - 書式：80カラムラップ、判定ごとの改行、スタイル定義の改行を遵守。
 */

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react'
import {
  describe,
  it,
  expect,
  vi,
  beforeEach
} from 'vitest'
import '@testing-library/jest-dom'

// --- 型定義のインポート ---
import { Member } from '@/types/member'

// @ts-ignore
import EditProfilePage from './page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  updateMemberProfile,
  checkNicknameExists
} from '@/lib/memberApi'

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

describe('EditProfilePage - プロフィール編集画面の業務ルール検証 V1.2.3', () => {
  // 内部での MemberStatus 定義を削除し、Member 型を使用
  const TEST_USER: Partial<Member> = {
    id: 'user-123',
    email: 'test@example.com',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    nickname: 'たろう',
    member_number: '101',
    roles: 'general',
    gender: '男性',
    birthday: '1990-01-01',
    status: 'active',
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
    vi.spyOn(window, 'alert').mockImplementation(() => { })

    // デフォルトの認証状態
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      user: TEST_USER,
    })

    // APIのデフォルト挙動
    vi.mocked(checkNicknameExists).mockResolvedValue(false)
    vi.mocked(updateMemberProfile).mockResolvedValue({
      success: true,
      data: null,
      error: null
    })
  })

  it('【表示/権限】一般メンバーが編集できない項目が readOnly であること', () => {
    render(<EditProfilePage />)

    const readOnlyFields = [
      // 本体側の自然なラベル「氏名」に完全一致させる
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

  it('【表示】メモ欄を含む編集可能項目の初期値が正しいこと', () => {
    render(<EditProfilePage />)

    expect(screen.getByLabelText(/ニックネーム/)).toHaveValue('たろう')
    expect(screen.getByLabelText('郵便番号')).toHaveValue('100-0001')
    expect(screen.getByLabelText('住所')).toHaveValue('東京都千代田区')
    
    // 「緊急連絡先電話番号」との重複を避けるため文字列完全一致で指定
    expect(screen.getByLabelText('電話番号')).toHaveValue('03-1111-2222')
    expect(screen.getByLabelText('緊急連絡先電話番号'))
      .toHaveValue('090-9999-9999')
      
    expect(screen.getByLabelText('続柄')).toHaveValue('妻')
    expect(screen.getByLabelText('緊急連絡用メモ')).toHaveValue('持病なし')
    expect(screen.getByLabelText('プロファイルメモ'))
      .toHaveValue('よろしくお願いします')
    expect(screen.getByLabelText('DUPR ID')).toHaveValue('D-12345')
  })

  it('【正常系】メモ欄を変更して保存した際、APIが正しい値を送信すること', 
    async () => {
    render(<EditProfilePage />)

    fireEvent.change(screen.getByLabelText('プロファイルメモ'), 
      { target: { value: '自己紹介を更新しました' } })
    
    fireEvent.change(screen.getByLabelText('緊急連絡用メモ'), 
      { target: { value: 'アレルギーあり' } })

    const saveBtn = screen.getByRole('button', { name: /保存する/ })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updateMemberProfile).toHaveBeenCalledWith(
        TEST_USER.id,
        expect.objectContaining({
          profile_memo: '自己紹介を更新しました',
          emg_memo: 'アレルギーあり'
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/members/profile')
    })
  })

  it('【バリデーション】ニックネーム重複時は保存を中断すること', async () => {
    vi.mocked(checkNicknameExists).mockResolvedValue(true)
    render(<EditProfilePage />)
    
    fireEvent.change(screen.getByLabelText(/ニックネーム/), 
      { target: { value: '重複太郎' } })
    
    fireEvent.click(screen.getByRole('button', { name: /保存する/ }))
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('既に他のメンバーに使用されています')
      )
      expect(updateMemberProfile).not.toHaveBeenCalled()
    })
  })

  it('【操作】キャンセルボタン押下でプロフィール画面に戻ること', () => {
    render(<EditProfilePage />)
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/i }))
    expect(mockPush).toHaveBeenCalledWith('/members/profile')
  })
})