/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.9.7
 * Update  : 2026-01-26
 * 修正内容：
 * V1.9.7
 * - Hook内での直接的な router.replace を廃止（app/page.tsxに集約）
 * - isLoading が false になる前に、必要な情報をすべて確定させるよう同期を強化
 */

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation' // router は不要になったので削除可
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

export const useAuthCheck = () => {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string | null>(null)
  const [currentLineId, setCurrentLineId] = useState<string | null>(null)
  const [lineNickname, setLineNickname] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // --- LINE環境判定 ---
        if (typeof window !== 'undefined' && /Line/i.test(navigator.userAgent)) {
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID
          await liff.init({ liffId: liffId || 'DUMMY_ID' })
          
          if (!liff.isLoggedIn()) {
            liff.login()
            return
          }

          const profile = await liff.getProfile()
          setLineNickname(profile.displayName)
          setCurrentLineId(profile.userId) // まずIDをセット

          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('line_id', profile.userId)
            .maybeSingle()

          if (member) {
            setUser(member)
            setUserRoles(member.roles)
          }
          // Hook内でのリダイレクトは削除。案内係(page.tsx)に任せる。
          setIsLoading(false)
          return
        }

        // --- PCブラウザ処理 ---
        const memberIdToCheck = typeof window !== 'undefined' 
          ? sessionStorage.getItem('auth_member_id') 
          : null

        if (memberIdToCheck) {
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberIdToCheck)
            .maybeSingle()

          if (member) {
            setUser(member)
            setUserRoles(member.roles || '')
            setCurrentLineId(member.line_id || null)
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Auth Check Error:', err)
        setIsLoading(false)
      }
    }
    initAuth()
  }, [pathname]) // パスが変わるたびに再チェック

  return { isLoading, userRoles, currentLineId, lineNickname, user }
}