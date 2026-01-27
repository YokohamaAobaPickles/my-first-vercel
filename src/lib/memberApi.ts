/**
 * Filename: src/lib/memberApi.ts
 * Version : V1.1.0
 * Update  : 2026-01-26
 * 修正内容：
 * V1.1.0
 * - テストコード V1.1.0 の期待値に合わせ、エラー時の戻り値を調整
 * - fetchPendingMembers, updateMemberStatus, fetchMemberById の実装
 */

import { supabase } from './supabase'

/**
 * 承認待ち会員(registration_request)の一覧を取得する
 */
export const fetchPendingMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'registration_request')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('fetchPendingMembers error:', error)
    return []
  }
  return data || []
}

/**
 * 特定の会員情報を取得する
 */
export const fetchMemberById = async (id: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('fetchMemberById error:', error)
    return null
  }
  return data
}

/**
 * 会員のステータスを更新する
 */
export const updateMemberStatus = async (id: string, status: 'active' | 'registration_request') => {
  const { error } = await supabase
    .from('members')
    .update({ status })
    .eq('id', id)
  
  if (error) {
    console.error('updateMemberStatus error:', error)
    return { success: false, error }
  }
  return { success: true }
}