import { expect, test } from 'vitest'

// 「ユーザーが存在するかどうか」でメッセージを出し分けるロジックのテスト
function getWelcomeMessage(exists: boolean, name: string) {
  return exists ? `${name} さん、おかえりなさい！` : "はじめまして！情報を登録しました。";
}

test('LINEユーザーの訪問回数に応じたメッセージ判定', () => {
  expect(getWelcomeMessage(true, "横浜太郎")).toBe("横浜太郎 さん、おかえりなさい！")
  expect(getWelcomeMessage(false, "")).toBe("はじめまして！情報を登録しました。")
})