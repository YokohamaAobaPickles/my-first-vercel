/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.2.0
 * Update: 2026-01-23
 * 内容：
 * V1.2.0
 * - LINEアプリ内から起動かブラウザから起動かを判定
 * V1.1.0
 * - 認証状態と登録状況をチェックし、ページで使いやすい値を返す
 * V1.0.0
 * - LINEログイン状態と会員登録の有無をチェックし、未登録なら登録画面へ誘導する
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

        // A. LINEアプリ内の場合
        if (liff.isInClient()) {
          if (!liff.isLoggedIn()) {
            liff.login() // トーク内からなら即ログイン
            return
          }
        }
        // B. 外部ブラウザの場合
        else {
          if (!liff.isLoggedIn() && pathname !== '/members/login') {
            // ログイン画面以外なら飛ばすが、ログイン画面なら留まる
            router.push('/members/login')
            return
          }
        }

        // --- ログイン済み（またはログイン不要画面）の処理 ---
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile()
          setCurrentLineId(profile.userId)

          const { data: member } = await supabase
            .from('members')
            .select('line_id, roles, status')
            .eq('line_id', profile.userId)
            .single()

          if (member) {
            setUserRoles(member.roles)
          } else if (pathname !== '/members/login') {
            router.push('/members/login')
          }
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