/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.11.0
 * Update  : 2026-02-06
 * 修正内容：
 * V1.11.0
 * - logout フラグを LINE / ブラウザ共通で参照
 * - logout フラグがある場合は user を作らず即 isLoading=false
 * - login ページで logout フラグを消した後は自動ログインが復活
 */

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

export const useAuthCheck = () => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string[] | null>(null)
  const [currentLineId, setCurrentLineId] = useState<string | null>(null)
  const [lineNickname, setLineNickname] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const ua = typeof window !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
        const isLine = ua.includes('line')

        // ---------------------------------------------------------
        // 共通：logout フラグチェック
        // ---------------------------------------------------------
        let logoutFlag = null
        if (typeof window !== 'undefined') {
          logoutFlag = isLine
            ? localStorage.getItem('logout')
            : sessionStorage.getItem('logout')
        }

        if (logoutFlag) {
          // ログアウト直後は user を作らない
          setIsLoading(false)
          return
        }

        // ---------------------------------------------------------
        // LINE アプリ内ブラウザ
        // ---------------------------------------------------------
        if (isLine && typeof window !== 'undefined') {
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID
          await liff.init({ liffId: liffId || 'DUMMY_ID' })

          // ログアウト直後は liff.isLoggedIn() が false
          if (!liff.isLoggedIn()) {
            setIsLoading(false)
            return
          }

          const profile = await liff.getProfile()
          setLineNickname(profile.displayName)
          setCurrentLineId(profile.userId)

          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('line_id', profile.userId)
            .maybeSingle()

          if (member) {
            const fixedRoles = Array.isArray(member.roles)
              ? member.roles
              : member.roles ? [member.roles] : []

            setUser({ ...member, roles: fixedRoles })
            setUserRoles(fixedRoles)
          }

          setIsLoading(false)
          return
        }

        // ---------------------------------------------------------
        // PC / スマホブラウザ
        // ---------------------------------------------------------
        if (typeof window !== 'undefined') {
          const memberIdToCheck = sessionStorage.getItem('auth_member_id')

          if (memberIdToCheck) {
            const { data: member } = await supabase
              .from('members')
              .select('*')
              .eq('id', memberIdToCheck)
              .maybeSingle()

            if (member) {
              const fixedRoles = Array.isArray(member.roles)
                ? member.roles
                : member.roles ? [member.roles] : []

              setUser({ ...member, roles: fixedRoles })
              setUserRoles(fixedRoles)
              setCurrentLineId(member.line_id || null)
            }
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Auth Check Error:', err)
        setIsLoading(false)
      }
    }

    initAuth()
  }, [pathname])

  return { isLoading, userRoles, currentLineId, lineNickname, user }
}
