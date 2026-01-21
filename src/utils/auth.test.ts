/**
 * Filename: utils/auth.test.ts
 * Version : V1.0.0
 * Update  : 2026-01-21 
 */
import { describe, it, expect } from 'vitest'
import { isAdmin } from './auth'

describe('isAdmin', () => {
  it('役割に「役員」が含まれる場合はtrueを返す', () => {
    expect(isAdmin('役員')).toBe(true)
    expect(isAdmin('役員,広報')).toBe(true)
  })

  it('役割に「広報」が含まれる場合はtrueを返す', () => {
    expect(isAdmin('広報')).toBe(true)
  })

  it('それ以外（一般、null、空文字）はfalseを返す', () => {
    expect(isAdmin('一般')).toBe(false)
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin('')).toBe(false)
  })
})