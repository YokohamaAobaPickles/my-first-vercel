/**
 * Filename: src/app/members/search/page.test.tsx
 * Version : V1.0.1
 * Update  : 2026-02-04
 * Remarks : 検索画面の統合テスト（UI・遷移・非同期）
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

import { useAuthCheck } from '@/hooks/useAuthCheck'
vi.mock('@/hooks/useAuthCheck')

import type { Member } from '@/types/member'
import type { MemberStatus } from '@/types/member' // enum がある場合

import SearchPage from './page'
import * as memberApi from '@/lib/memberApi'

/* --------------------
 * モック定義（profile と同じ方式）
 * -------------------- */
//vi.mock('@/lib/memberApi')   // ← これが重要（個別定義しない）
vi.mock('@/lib/memberApi', () => ({
  fetchMembersByQuery: vi.fn(),
}))

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
  usePathname: () => '/members/search',   // ← これが必要
}))

/* --------------------
 * ダミーデータ
 * -------------------- */

const MOCK_MEMBERS: Member[] = [
  {
    id: 'abc-123',
    email: 'tomo@example.com',
    name: '智規',
    name_roma: 'Tomo',
    nickname: 'トモ',
    emg_tel: '000-0000-0000',
    emg_rel: 'friend',
    status: 'active' as MemberStatus,   // enum の値に合わせて変更
    member_kind: 'general',
    roles: ['member'],

    // 任意項目
    member_number: '1007',
    is_profile_public: true,

    line_id: null,
    password: null,
    gender: null,
    birthday: null,
    tel: null,
    postal: null,
    address: null,
    profile_icon_url: null,
    profile_memo: null,
    emg_memo: null,
    introducer: null,
    dupr_id: null,
    dupr_email: null,
    dupr_rate: null,
    dupr_rate_singles: null,
    dupr_rate_doubles: null,
    dupr_rate_date: null,
    last_login_date: null,
    req_date: null,
    approval_date: null,
    suspend_date: null,
    withdraw_date: null,
    reject_date: null,
    create_date: null,
    update_date: null,
    reset_token: null,
    reset_token_expires_at: null,
  },
]

describe('SearchPage 統合検証 V1.0.1', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAuthCheck).mockReturnValue({
      isLoading: false,
      user: { id: 'u1', nickname: 'テストユーザー' },
      userRoles: ['member'],
      currentLineId: null,
      lineNickname: null,
    })

    vi.spyOn(window, 'alert').mockImplementation(() => { })
  })


  /* --------------------
   * 初期表示
   * -------------------- */
  it('検索画面が正しく表示される', () => {
    render(<SearchPage />)

    expect(screen.getByText('会員検索')).toBeInTheDocument()
    //expect(screen.getByLabelText('ニックネーム')).toBeInTheDocument()
    //expect(screen.getByLabelText('会員番号')).toBeInTheDocument()
    //expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    screen.getByRole('textbox', { name: 'ニックネーム' })
    screen.getByRole('textbox', { name: '会員番号' })
    screen.getByRole('textbox', { name: 'メールアドレス' })

  })

  /* --------------------
   * 入力なし → 結果なし
   * -------------------- */
  it('入力なしで検索すると「該当する会員が見つかりません」が表示される', async () => {
    vi.mocked(memberApi.fetchMembersByQuery).mockImplementation(
      async (nickname, memberNumber, email) => ({
        success: true,
        //data: MOCK_MEMBERS,
        data: [],
        error: null,
      })
    )


    render(<SearchPage />)

    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    expect(
      await screen.findByText('該当する会員が見つかりません')
    ).toBeInTheDocument()
  })

  /* --------------------
   * 検索アクション
   * -------------------- */
  it('ニックネーム一致でメンバーが表示される', async () => {
    vi.mocked(memberApi.fetchMembersByQuery).mockResolvedValueOnce({
      success: true,
      data: MOCK_MEMBERS,
      error: null,
    })

    render(<SearchPage />)

    fireEvent.change(screen.getByLabelText('ニックネーム'), {
      target: { value: 'トモ' },
    })

    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    expect(await screen.findByText('トモ')).toBeInTheDocument()
    expect(screen.getByText('1007')).toBeInTheDocument()
  })

  /* --------------------
   * 結果表示
   * -------------------- */
  it('検索結果に「詳細を見る」ボタンが表示される', async () => {
    vi.mocked(memberApi.fetchMembersByQuery).mockResolvedValueOnce({
      success: true,
      data: MOCK_MEMBERS,
      error: null,
    })

    render(<SearchPage />)

    fireEvent.change(screen.getByLabelText('ニックネーム'), {
      target: { value: 'トモ' },
    })

    fireEvent.click(screen.getByRole('button', { name: '検索' }))

    expect(
      await screen.findByRole('link', { name: '詳細を見る' })
    ).toBeInTheDocument()
  })

  /* --------------------
   * 遷移（プロフィールへ戻る）
   * -------------------- */
  it('「プロファイルに戻る」リンクが表示される', () => {
    render(<SearchPage />)

    expect(
      screen.getByRole('link', { name: 'プロファイルに戻る' })
    ).toBeInTheDocument()
  })
})
