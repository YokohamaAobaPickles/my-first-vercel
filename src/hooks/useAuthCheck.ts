/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.8.0
 * Update  : 2026-01-25
 * 内容：
 * V1.8.0
 * - 判定順序を刷新。LINEアプリ内(isInClient)かどうかで処理を完全分離。
 * - PCブラウザ時はLIFFを一切初期化せず、400エラーと画面停止を完全に防止。
 * V1.7.0
 * - PCログイン済みの場合のバイパスを試行（失敗）
 */

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

export const useAuthCheck = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string | null>(null)
  const [currentLineId, setCurrentLineId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // --- A. LINEアプリ内の場合 ---
        if (typeof window !== 'undefined' && /Line/i.test(navigator.userAgent)) {
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          
          if (!liff.isLoggedIn()) {
            liff.login()
            return
          }

          const profile = await liff.getProfile()
          setCurrentLineId(profile.userId)

          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('line_id', profile.userId)
            .single()

          if (member) {
            setUserRoles(member.roles)
            setUser(member)
          } else if (pathname !== '/members/login') {
            router.replace('/members/login')
          }
          setIsLoading(false)
          return
        }

        // --- B. PCブラウザ（LINEアプリ外）の場合 ---
        // LIFFは一切初期化せず、Supabaseのセッションを確認
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (member) {
            setUserRoles(member.roles)
            setCurrentLineId(member.line_id || null)
            setUser(member)
            setIsLoading(false)
            return
          }
        }

        // セッションがない or 会員登録がない場合、ログイン画面へ
        if (pathname !== '/members/login') {
          router.replace('/members/login')
        }
        setIsLoading(false)

      } catch (err) {
        console.error('Auth Check Error:', err)
        if (pathname !== '/members/login') {
          router.replace('/members/login')
        }
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router, pathname])

  return { isLoading, userRoles, currentLineId, user }
}