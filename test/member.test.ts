import { expect, test } from 'vitest'
import { getStatusMessage } from '../src/components/MemberStatus'
import { formatMemberName } from '../src/lib/memberLogic'

test('会員数に応じたメッセージ判定', () => {
  expect(getStatusMessage(0)).toBe("まだ会員がいません")
  expect(getStatusMessage(50)).toBe("募集中...")
  expect(getStatusMessage(100)).toBe("目標達成！")
})

test('会員名が正しく整形されること', () => {
  // 名前を受け取って「様」を付けるだけのシンプルなロジックを想定
  expect(formatMemberName('横浜太郎')).toBe('横浜太郎 様')
})