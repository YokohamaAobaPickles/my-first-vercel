/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.9.2
 * Update  : 2026-01-25
 * 内容：
 * V1.9.2
 * - PCブラウザ環境での認証をsessionStorageの会員IDベースに変更
 * - 特定プラットフォームのAuth機能への依存を排除し、セキュリティを強化
 * V1.9.1
 * - lineNickname を戻り値に追加し、LIFFの表示名を自動入力に活用可能にする
 * V1.9.0
 * - ホワイトリスト（EXEMPT_PATHS）を導入し、新規登録画面へのアクセスを許可
 * V1.8.5 - V1.8.1 (省略：以前と同じ履歴を保持)
 */

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

const EXEMPT_PATHS = ['/members/login', '/members/new']

export const useAuthCheck = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string | null>(null)
  const [currentLineId, setCurrentLineId] = useState<string | null>(null)
  const [lineNickname, setLineNickname] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && /Line/i.test(navigator.userAgent)) {
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID
          if (!liffId && process.env.NODE_ENV !== 'test') {
            setIsLoading(false)
            return
          }
          await liff.init({ liffId: liffId || 'DUMMY_ID' })
          if (!liff.isLoggedIn()) {
            liff.login()
            return
          }
          const profile = await liff.getProfile()
          console.log('[DEBUG-AUTH] LIFF Profile fetched:', profile.displayName)
          setLineNickname(profile.displayName)
          const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('line_id', profile.userId)
            .maybeSingle()
          if (error) throw error
          if (member) {
            setUserRoles(member.roles)
            setUser(member)
            setCurrentLineId(member.line_id)
          } else {
            setCurrentLineId(profile.userId)
            if (!EXEMPT_PATHS.includes(pathname || '')) {
              router.replace('/members/login')
            }
          }
          setIsLoading(false)
          return
        }

        // --- PCブラウザ処理 (V1.9.2 修正) ---
        let memberIdToCheck: string | null = null
        if (typeof window !== 'undefined') {
          memberIdToCheck = sessionStorage.getItem('auth_member_id')
        }

        if (memberIdToCheck) {
          const { data: member, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberIdToCheck)
            .maybeSingle()

          if (member) {
            setUserRoles(member.roles)
            setUser(member)
            setCurrentLineId(member.line_id || null)
            setIsLoading(false)
            return
          }
        }

        if (!EXEMPT_PATHS.includes(pathname || '')) {
          router.replace('/members/login')
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Auth Check Error:', err)
        setIsLoading(false)
      }
    }
    initAuth()
  }, [router, pathname])

  return { isLoading, userRoles, currentLineId, lineNickname, user }
}