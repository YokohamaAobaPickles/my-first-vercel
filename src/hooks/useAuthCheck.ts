/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.1.0
 * Update: 2026-01-22
 * 内容：
 * V1.1.0
 * 内容：認証状態と登録状況をチェックし、ページで使いやすい値を返す
  * V1.0.0
 * LINEログイン状態と会員登録の有無をチェックし、未登録なら登録画面へ誘導する
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const profile = await liff.getProfile()
        setCurrentLineId(profile.userId)
        
        const { data: member, error } = await supabase
          .from('members')
          .select('line_id, roles, status')
          .eq('line_id', profile.userId)
          .single()

        // 1. 未登録なら登録画面へ強制移動（登録画面自体にいる時は除く）
        if ((error || !member) && pathname !== '/members/register') {
          router.push('/members/register')
          return
        }

        // 2. 登録がある場合はロールを保持
        if (member) {
          setUserRoles(member.roles)
        }
      } catch (err) {
        console.error('Auth Check Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router, pathname])

  return { isLoading, userRoles, currentLineId }
}