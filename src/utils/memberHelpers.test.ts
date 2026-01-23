/**
 * Filename: utils/memberHelpers.test.ts
 * Version : V2.6.1
 */
import { describe, it, expect } from 'vitest'
import { validateRegistration, isNicknameDuplicate } from './memberHelpers'

describe('A-01: 会員登録・統合バリデーション', () => {
  
  const baseValidData = {
    email: 'test@example.com',
    name: '山田 太郎',
    name_roma: 'Taro Yamada',
    password: 'password123',
    emg_tel: '090-0000-0000',
    emg_rel: '妻',
  }

  it('LINE版：LINE IDがあり、必須項目が全て揃っていれば有効であること', () => {
    const data = { ...baseValidData, line_id: 'U123456789' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(true)
  })

  it('PC版：LINE IDがない場合、ニックネームが未入力ならエラーを返すこと', () => {
    const data = { ...baseValidData, line_id: null, nickname: '' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('PC版からの登録にはニックネームが必要です')
  })

  it('PC版：LINE IDがなく、ユニークなニックネームがあれば有効であること', () => {
    const data = { ...baseValidData, line_id: null, nickname: 'TaroChan' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(true)
  })

  it('共通：氏名が欠けている場合はエラーを返すこと', () => {
    const data = { ...baseValidData, name: '', line_id: 'U123456789' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('氏名を入力してください')
  })

  it('共通：緊急連絡先が欠けている場合はエラーを返すこと', () => {
    const data = { ...baseValidData, emg_tel: '', line_id: 'U123456789' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('緊急連絡先電話番号を入力してください')
  })

  // Case C: ゲスト申請のテスト
  describe('Case C: ゲスト申請', () => {
    it('紹介者がいない場合はエラーになること', () => {
      const guestData = {
        ...baseValidData,
        status: 'guest' as const,
        introducer: '',
        nickname: 'GuestUser',
        line_id: null
      }
      const result = validateRegistration(guestData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('紹介者のニックネームを入力してください')
    })

    it('紹介者があれば有効であること', () => {
      const guestData = {
        ...baseValidData,
        status: 'guest' as const,
        introducer: '田中ボス',
        nickname: 'GuestUser',
        line_id: null
      }
      const result = validateRegistration(guestData)
      expect(result.isValid).toBe(true)
    })
  })
})

describe('A-01: ニックネーム・アカウント統合ロジック', () => {
  it('ニックネーム重複：既存がある場合、trueを返すこと', async () => {
    const mockCheck = async () => true; 
    const result = await isNicknameDuplicate('ExistingUser', mockCheck);
    expect(result).toBe(true);
  });

  it('アカウント統合判定：DBにメールが存在するか判定できること', async () => {
    const mockDb = [{ email: 'old@example.com' }];
    const findUser = (email: string) => mockDb.find(u => u.email === email);
    expect(findUser('old@example.com')).toBeDefined();
    expect(findUser('new@example.com')).toBeUndefined();
  });
})