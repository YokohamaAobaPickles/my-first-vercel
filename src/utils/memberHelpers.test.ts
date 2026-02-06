/**
 * Filename: src/utils/memberHelpers.test.ts
 * Version : V5.0.0
 * Update  : 2026-01-27
 * 内容：
 * - 過去(V3.1.0)のテストケースを全て統合
 * - ベースデータ＋スプレッド演算子による Factory パターンを採用
 * - MemberInput 型に完全準拠し as any を排除
 */
import { describe, it, expect } from 'vitest'
import {
  validateRegistration,
  isNicknameDuplicate,
  calculateEnrollmentDays
} from './memberHelpers'
import { MemberInput } from '@/types/member'

import { hasOfficerRole } from './memberHelpers'
import { ROLES } from '@/types/member'

describe('memberHelpers 総合検証 V5.0.0', () => {

  /**
   * 黄金のベースデータ：
   * 全てのバリデーション（共通、PC版、ゲスト版）をパスする状態
   */
  const VALID_MEMBER_BASE: MemberInput = {
    line_id: 'u123456789',
    nickname: 'たろう',
    email: 'test@example.com',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    gender: '男性',
    birthday: '1990-01-01',
    roles: ['member'],
    tel: '03-1234-5678',
    postal: '123-4567',
    address: '東京都...',
    member_kind: 'general',
    status: 'active',
    introducer: '紹介者名',
    profile_memo: null,
    emg_tel: '090-0000-0000',
    emg_rel: '妻',
    emg_memo: '緊急連絡時の補足事項',
    dupr_id: null,
    dupr_rate_singles: null,
    dupr_rate_doubles: null,
    dupr_rate_date: null
  };

  describe('validateRegistration (バリデーション)', () => {
    it('【正常系】全ての項目が適切に入力されていればパスすること', () => {
      const result = validateRegistration(VALID_MEMBER_BASE)
      expect(result.isValid).toBe(true)
    })

    describe('共通必須チェック', () => {
      it('氏名が空（またはスペースのみ）の場合はエラー', () => {
        const data1 = { ...VALID_MEMBER_BASE, name: '' }
        const data2 = { ...VALID_MEMBER_BASE, name: ' 　 ' } // 半角全角混じり
        expect(validateRegistration(data1).isValid).toBe(false)
        expect(validateRegistration(data2).isValid).toBe(false)
      })

      it('緊急連絡先(emg_tel)が空の場合はエラー', () => {
        const data = { ...VALID_MEMBER_BASE, emg_tel: '' }
        expect(validateRegistration(data).isValid).toBe(false)
        expect(validateRegistration(data).errors).toContain('緊急連絡先電話番号を入力してください')
      })
    })

    describe('条件付きバリデーション (Case B: PC版/LINE版)', () => {
      it('LINE IDがない場合、ニックネームが空だとエラー', () => {
        const data = { ...VALID_MEMBER_BASE, line_id: null, nickname: '' }
        const result = validateRegistration(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('PC版からの登録にはニックネームが必要です')
      })

      it('LINE IDがあれば、ニックネームが空でもパスする', () => {
        const data = { ...VALID_MEMBER_BASE, line_id: 'U123', nickname: '' }
        expect(validateRegistration(data).isValid).toBe(true)
      })
    })

    describe('条件付きバリデーション (Case C: ゲスト)', () => {
      it('member_kind が guest の時、紹介者が空だとエラー', () => {
        const data = {
          ...VALID_MEMBER_BASE,
          member_kind: 'guest',
          introducer: '',
          introducer_member_number: '0001'
        }
        const result = validateRegistration(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('紹介者のニックネームを入力してください')
      })

      it('member_kind が guest の時、紹介者会員番号が空だとエラー', () => {
        const data = {
          ...VALID_MEMBER_BASE,
          member_kind: 'guest',
          introducer: '紹介者',
          introducer_member_number: ''
        }
        const result = validateRegistration(data)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('紹介者の会員番号を入力してください')
      })

      it('member_kind が general(会員) の時、紹介者が空でもパスする', () => {
        const data = { ...VALID_MEMBER_BASE, member_kind: 'general', introducer: '' }
        expect(validateRegistration(data).isValid).toBe(true)
      })
    })
  })

  describe('calculateEnrollmentDays (在籍日数計算)', () => {
    it('10日前の日付なら 10 を返すこと', () => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      expect(calculateEnrollmentDays(date.toISOString())).toBe(10)
    })

    it('今日の日付なら 0 を返すこと', () => {
      const today = new Date().toISOString()
      expect(calculateEnrollmentDays(today)).toBe(0)
    })

    it('未来の日付の場合は 0 を返すこと (ガードロジックの検証)', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(calculateEnrollmentDays(tomorrow.toISOString())).toBe(0)
    })

    it('日付が未定義(null/undefined)の場合は "-" を返すこと', () => {
      expect(calculateEnrollmentDays(null)).toBe('-')
      expect(calculateEnrollmentDays(undefined)).toBe('-')
    })
  })

  describe('isNicknameDuplicate (ニックネーム重複チェック)', () => {
    it('checkFnがtrueを返せば、結果としてtrueを返すこと', async () => {
      const mockCheck = async (_n: string) => true
      const result = await isNicknameDuplicate('重複太郎', mockCheck)
      expect(result).toBe(true)
    })

    it('ニックネームが空の場合は、checkFnを呼ばずにfalseを返すこと', async () => {
      let called = false
      const mockCheck = async (_n: string) => {
        called = true
        return true
      }
      const result = await isNicknameDuplicate('', mockCheck)
      expect(result).toBe(false)
      expect(called).toBe(false) // 呼ばれていないことを検証
    })
  })

  // --- 異常系：メールアドレス必須・フォーマット ---
  it('メールアドレスが空だとエラーにすること（一般・ゲストいずれも必須）', () => {
    const data = { ...VALID_MEMBER_BASE, email: '' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('メールアドレスを入力してください')
  })

  it('メールアドレスに「@」が含まれない場合はエラーにすること', () => {
    const data = { ...VALID_MEMBER_BASE, email: 'invalid-email' }
    const result = validateRegistration(data)
    expect(result.errors).toContain('有効なメールアドレスを入力してください')
  })

  // --- 境界系：未定義（undefined）のハンドリング ---
  it('必須項目が undefined の場合も適切にエラーを返すこと', () => {
    const data = { ...VALID_MEMBER_BASE, name: undefined as any }
    expect(validateRegistration(data).isValid).toBe(false)
  })

  describe('hasOfficerRole (役職判定)', () => {
    it('役職が member のみなら false', () => {
      expect(hasOfficerRole({ roles: ['member'] })).toBe(false)
    })

    it('会長を含む場合は true', () => {
      expect(hasOfficerRole({ roles: [ROLES.PRESIDENT] })).toBe(true)
    })

    it('複数役職（会長 + イベント担当）でも true', () => {
      expect(hasOfficerRole({ roles: [ROLES.PRESIDENT, 'event_manager'] })).toBe(true)
    })

    it('roles が空配列なら false', () => {
      expect(hasOfficerRole({ roles: [] })).toBe(false)
    })

    it('roles が null/undefined なら false', () => {
      expect(hasOfficerRole({ roles: null })).toBe(false)
      expect(hasOfficerRole({})).toBe(false)
    })
  })

})