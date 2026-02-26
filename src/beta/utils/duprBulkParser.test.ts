/**
 * Filename: src/utils/duprBulkParser.test.ts
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : DUPR一括登録パーサーの単体テスト
 */

import { describe, it, expect } from 'vitest'
import {
  parseDuprBulkFile,
  type DuprBulkRow,
} from './duprBulkParser'

describe('parseDuprBulkFile', () => {
  it('サンプル通りの3件をパースできる', () => {
    const text = `Tomo Yamashita
WKRV2Q
Yokohama, Kanagawa, JP
• M
2.26
NR

Keiko Ogaki
6KG7V0
Yokohama, Kanagawa, JP
51 • F
2.68
NR

AKIKO TAKATORI
RWKEXM
Yokohama, Kanagawa, JP
54 • F
3.35
NR
`
    const rows = parseDuprBulkFile(text)
    expect(rows).toHaveLength(3)

    expect(rows[0]).toMatchObject({
      name: 'Tomo Yamashita',
      duprId: 'WKRV2Q',
      address: 'Yokohama, Kanagawa, JP',
      ageGender: '• M',
      doublesRating: 2.26,
      singlesRating: 0,
    })
    expect(rows[1]).toMatchObject({
      name: 'Keiko Ogaki',
      duprId: '6KG7V0',
      doublesRating: 2.68,
      singlesRating: 0,
    })
    expect(rows[2]).toMatchObject({
      name: 'AKIKO TAKATORI',
      duprId: 'RWKEXM',
      doublesRating: 3.35,
      singlesRating: 0,
    })
  })

  it('NR は 0.0 として解釈する', () => {
    const text = `A
ID1
addr
• M
NR
NR
`
    const rows = parseDuprBulkFile(text)
    expect(rows).toHaveLength(1)
    expect(rows[0].doublesRating).toBe(0)
    expect(rows[0].singlesRating).toBe(0)
  })

  it('空文字列は空配列を返す', () => {
    expect(parseDuprBulkFile('')).toEqual([])
    expect(parseDuprBulkFile('   \n\n  ')).toEqual([])
  })

  it('6行に満たないブロックはスキップする', () => {
    const text = `Name
DUPR1
Address
`
    const rows = parseDuprBulkFile(text)
    expect(rows).toHaveLength(0)
  })

  it('数値レーティングを正しくパースする', () => {
    const text = `X
DX
addr
• F
1.50
2.00
`
    const rows = parseDuprBulkFile(text)
    expect(rows[0].doublesRating).toBe(1.5)
    expect(rows[0].singlesRating).toBe(2)
  })
})
