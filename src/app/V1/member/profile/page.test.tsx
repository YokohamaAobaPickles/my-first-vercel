/**
 * Filename: src/app/V1/member/profile/page.test.tsx
 * Version : V1.0.0
 * Update  : 2026-02-26
 * Remarks :
 * V1.0.0 - プロフィール表示画面の仕様をテストで表現（TDD）。
 * useAuthCheck / useRouter をモック。本体実装は未作成のため Red を期待。
 */

import { describe, test, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@v1/hooks/useAuthCheck'
import { ROLES } from '@v1/types/member'
import ProfilePage from '@/app/V1/member/profile/page'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/V1/member/profile'),
}))

vi.mock('@v1/hooks/useAuthCheck')

// useAuthCheck が返す user の最小形（会員情報・基本情報の表示に必要な項目）
const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'mem-001',
  email: 'yokohama.aoba.pickles@gmail.com',
  name: '横浜青葉ピックルズ',
  name_roma: 'Yokohama Aoba Pickles',
  nickname: '横浜青葉XXXX',
  emg_tel: '999-9999-9999',
  emg_rel: '家族',
  emg_memo: 'ここには既往症や、注意事項を記入',
  status: 'active',
  member_kind: 'general',
  roles: [ROLES.MEMBER],
  member_number: '0001',
  profile_memo:
    '横浜青葉ピックルズです。2024年12月に創設されました。横浜市青葉区の地区センターを中心に、週2〜3回ピックルボール会を開催しています。',
  dupr_rate_doubles: 2.513,
  dupr_rate_singles: 0,
  dupr_rate_date: '2026-02-11',
  gender: 'その他',
  birthday: '2024-12-21',
  postal: '225-0001',
  tel: '090-1234-5678',
  address: '横浜市青葉区美しが丘西3-00-00',
  is_profile_public: true,
  ...overrides,
})

describe('V1 プロフィール表示画面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ push: vi.fn(), replace: vi.fn() })
  })

  // -------------------- ガード・初期表示（Red 確認用を含む） --------------------
  test('ローディング中は「読み込み中」が表示される', () => {
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: true,
      user: null,
      userRoles: null,
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/読み込み中/)).toBeInTheDocument()
  })

  test('ユーザーが存在しない場合はエラーメッセージまたは適切な表示がされる', () => {
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user: null,
      userRoles: null,
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const errorOrMessage = screen.queryByText(/ユーザー情報が見つかりません|情報が見つかりません/)
    expect(errorOrMessage).toBeTruthy()
  })

  test('データが空（必須項目のみ）の場合でもラベルは表示される', () => {
    const minimalUser = createMockUser({
      member_number: '',
      profile_memo: '',
      dupr_rate_doubles: null,
      dupr_rate_singles: null,
      dupr_rate_date: null,
      is_profile_public: false,
    })
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user: minimalUser,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText('会員番号')).toBeInTheDocument()
    expect(screen.getByText('プロフィール')).toBeInTheDocument()
    expect(screen.getByText('基本情報')).toBeInTheDocument()
  })

  // -------------------- 会員情報カード --------------------
  test('会員情報カードに会員番号・会員種別・ステータスが表示される', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText('会員番号')).toBeInTheDocument()
    expect(screen.getByText('0001')).toBeInTheDocument()
    expect(screen.getByText('会員種別')).toBeInTheDocument()
    expect(screen.getByText('一般')).toBeInTheDocument()
    expect(screen.getByText('ステータス')).toBeInTheDocument()
    expect(screen.getByText('有効')).toBeInTheDocument()
  })

  test('会員情報カードにプロフィール欄（複数行テキスト）が表示される', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/プロフィール/)).toBeInTheDocument()
    expect(
      screen.getByText(/横浜青葉ピックルズです。2024年12月に創設されました。/)
    ).toBeInTheDocument()
  })

  test('会員情報カードに DUPR（ダブルス・シングルス・記録日）が表示される', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/DUPR/)).toBeInTheDocument()
    expect(screen.getByText('2.513')).toBeInTheDocument()
    expect(screen.getByText('2026-02-11')).toBeInTheDocument()
  })

  test('「検索」が /V1/member/search へのリンクであること', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const searchLink = screen.getByRole('link', { name: /検索/ })
    expect(searchLink).toBeInTheDocument()
    expect(searchLink).toHaveAttribute('href', '/V1/member/search')
  })

  test('canManageMembers が true の時のみ「管理」ボタン（またはリンク）が表示される', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER_MANAGER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const manageLink = screen.getByRole('link', { name: /管理/ })
    expect(manageLink).toBeInTheDocument()
  })

  test('canManageMembers が false の時は「管理」が表示されない', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const manageLink = screen.queryByRole('link', { name: /管理/ })
    expect(manageLink).not.toBeInTheDocument()
  })

  // -------------------- 基本情報カード --------------------
  test('is_profile_public が false の時、「(非公開)」と🔒が表示される', () => {
    const user = createMockUser({ is_profile_public: false })
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText(/基本情報/)).toBeInTheDocument()
    const nonPublicEl = screen.getByText(/非公開/)
    expect(nonPublicEl).toBeInTheDocument()
    expect(nonPublicEl.textContent).toMatch(/🔒/)
  })

  test('基本情報カードにメール・氏名・性別・生年月日・郵便・電話・緊急連絡先が表示される', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByText('yokohama.aoba.pickles@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('氏名')).toBeInTheDocument()
    expect(screen.getByText('横浜青葉ピックルズ')).toBeInTheDocument()
    expect(screen.getByText('性別')).toBeInTheDocument()
    expect(screen.getByText('その他')).toBeInTheDocument()
    expect(screen.getByText('生年月日')).toBeInTheDocument()
    expect(screen.getByText('2024-12-21')).toBeInTheDocument()
    expect(screen.getByText(/郵便/)).toBeInTheDocument()
    expect(screen.getByText('225-0001')).toBeInTheDocument()
    expect(screen.getByText('電話番号')).toBeInTheDocument()
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument()
    expect(screen.getByText(/緊急連絡先/)).toBeInTheDocument()
    expect(screen.getByText('999-9999-9999')).toBeInTheDocument()
    expect(screen.getByText('家族')).toBeInTheDocument()
  })

  test('「編集」が /V1/member/edit へのリンクであること', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const editLink = screen.getByRole('link', { name: /編集/ })
    expect(editLink).toBeInTheDocument()
    expect(editLink).toHaveAttribute('href', '/V1/member/edit')
  })

  // -------------------- 共通機能 --------------------
  test('useAuthCheck の user が会員番号・ニックネーム・役割に正しくマッピングされている', () => {
    const user = createMockUser({
      member_number: '0042',
      nickname: 'テストニック',
      roles: [ROLES.ANNOUNCEMENT_MANAGER],
    })
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.ANNOUNCEMENT_MANAGER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    expect(screen.getByText('0042')).toBeInTheDocument()
    expect(screen.getByText('テストニック')).toBeInTheDocument()
    expect(screen.getByText('お知らせ担当')).toBeInTheDocument()
  })

  test('画面最下部にナビゲーションメニューが存在する', () => {
    const user = createMockUser()
    ;(useAuthCheck as Mock).mockReturnValue({
      isLoading: false,
      user,
      userRoles: [ROLES.MEMBER],
      currentLineId: null,
      lineNickname: null,
    })
    render(<ProfilePage />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})
