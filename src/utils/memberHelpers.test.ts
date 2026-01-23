/**
 * Filename: utils/memberHelpers.test.ts
 * Version : V1.0.0
 * 内容：A-01 会員登録ロジックのバリデーションテスト（テストファースト）
 */
import { describe, it, expect } from 'vitest'
import { validateRegistration, isNicknameDuplicate } from './memberHelpers' // ★ ここに追加

describe('A-01: 会員登録バリデーション', () => {
  
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

  it('共通：必須項目（氏名）が欠けている場合はエラーを返すこと', () => {
    const data = { ...baseValidData, name: '', line_id: 'U123456789' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('氏名は必須です')
  })

  it('共通：緊急連絡先が欠けている場合はエラーを返すこと', () => {
    const data = { ...baseValidData, emg_tel: '', line_id: 'U123456789' }
    const result = validateRegistration(data)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('緊急連絡先は必須です')
  })
})

// memberHelpers.test.ts に追記
describe('A-01: ニックネーム重複チェック', () => {
  it('既存のニックネームがある場合、エラーを返すこと', async () => {
    // 仮のDB問い合わせ関数（後で作成）が「存在する」と返した場合
    const mockCheck = async () => true; 
    const result = await isNicknameDuplicate('ExistingUser', mockCheck);
    expect(result).toBe(true);
  });

  it('新しいニックネームの場合、重複なし（false）を返すこと', async () => {
    const mockCheck = async () => false;
    const result = await isNicknameDuplicate('NewUser', mockCheck);
    expect(result).toBe(false);
  });
});