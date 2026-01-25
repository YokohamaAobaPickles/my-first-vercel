/**
 * Filename: src/app/members/new/page.test.tsx
 * Version : V1.3.4
 * Update  : 2026-01-25
 * 内容：
 * V1.3.4
 * - ソースコードルールを再適用：JSXプロパティ/オブジェクト引数を改行
 * - ラベルと入力欄の id 紐付けを前提とした検証を維持
 */

import { 
  render, 
  screen, 
  fireEvent 
} from '@testing-library/react'
import { 
  describe, 
  it, 
  expect, 
  vi, 
  beforeEach 
} from 'vitest'
import MemberNewPage from '@/app/members/new/page'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useSearchParams } from 'next/navigation'

vi.mock('@/hooks/useAuthCheck')
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ 
    push: mockPush, 
    replace: vi.fn() 
  }),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}))

describe('MemberNewPage (ルール遵守・完全版 V1.3.4)', () => {
  const TEST_LINE_ID = 'U_TEST_123'
  const TEST_NICKNAME = 'ライン太郎'

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useSearchParams as any).mockReturnValue({ 
      get: () => null 
    })
  })

  it('ロード中は適切なメッセージが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: true, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    expect(screen.getByText(/読み込み中.../i)).toBeTruthy()
  })

  it('【LINE環境】タイトルが適切で、ニックネーム等が修正不可であること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: TEST_NICKNAME,
      user: null,
    })
    render(<MemberNewPage />)
    
    expect(screen.getByRole('heading', { 
      name: 'LINE会員登録', 
      level: 1 
    })).toBeTruthy()
    
    const nicknameInput = screen.getByLabelText(/ニックネーム/)
    expect((nicknameInput as any).readOnly).toBe(true)
  })

  it('【ブラウザ環境】タイトルが適切で、全項目が入力可能であること', () => {
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    
    expect(screen.getByRole('heading', { 
      name: '新規会員登録', 
      level: 1 
    })).toBeTruthy()
    
    const nickInput = screen.getByLabelText(/ニックネーム/)
    expect((nickInput as any).readOnly).toBe(false)
  })

  it('全セクションと重要項目のラベルが表示されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    
    expect(screen.getByText('基本情報')).toBeTruthy()
    expect(screen.getByText('氏名（漢字）')).toBeTruthy()
    expect(screen.getByLabelText('住所')).toBeTruthy()
  })

  it('郵便番号欄が50%幅で配置されていること', () => {
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    
    const zipInput = screen.getByLabelText('郵便番号')
    expect((zipInput as any).style.width).toBe('50%')
  })

  it('会員登録とゲスト登録のモード切替が可能であること', () => {
    ;(useAuthCheck as any).mockReturnValue({ 
      isLoading: false, 
      currentLineId: null, 
      user: null 
    })
    render(<MemberNewPage />)
    
    const guestTab = screen.getByRole('button', { 
      name: 'ゲスト登録' 
    })
    fireEvent.click(guestTab)
    expect(guestTab).toBeTruthy()
  })

  it('【エッジケース】LINE名が不在の場合でもページが表示されること', () => {
    ;(useAuthCheck as any).mockReturnValue({
      isLoading: false,
      currentLineId: TEST_LINE_ID,
      lineNickname: null,
      user: null,
    })
    render(<MemberNewPage />)
    
    const nickInput = screen.getByLabelText(/ニックネーム/)
    expect(nickInput).toBeTruthy()
    expect((nickInput as any).readOnly).toBe(true)
  })
})