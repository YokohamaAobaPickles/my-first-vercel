/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.5.0
 * Update  : 2026-01-25
 * 内容：
 * V1.5.0
 * - 戻り値に user (DBレコード全体) を追加。PCユーザーの既読判定用。
 * V1.4.0
 * - PCブラウザ時のリダイレクトガードを強化 (returnの追加とreplaceへの変更)
 * V1.3.0
 * - LINEアプリ内(isInClient)判定による自動ログインの切り分け
 * V1.1.0 ~ V1.2.1
 * - 認証状態と登録状況をチェックし、ページで使いやすい値を返す
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
  const [user, setUser] = useState<any>(null) // V1.5.0 追加

  useEffect(() => {
    const initAuth = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })

        // 1. 未ログイン時の振り分け
        if (!liff.isLoggedIn()) {
          if (liff.isInClient()) {
            liff.login()
          } else {
            if (pathname !== '/members/login') {
              router.replace('/members/login')
            }
          }
          setIsLoading(false)
          return 
        }

        // 2. ログイン済みの処理
        const profile = await liff.getProfile()
        setCurrentLineId(profile.userId)

        // roles だけでなく全てのカラム (*) を取得するように変更
        const { data: member, error } = await supabase
          .from('members')
          .select('*')
          .eq('line_id', profile.userId)
          .single()

        if (member) {
          setUserRoles(member.roles)
          setUser(member) // V1.5.0 追加
        } else {
          if (pathname !== '/members/login') {
            router.replace('/members/login')
          }
        }

      } catch (err) {
        console.error('Auth Check Error:', err)
        if (pathname !== '/members/login') {
          router.replace('/members/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router, pathname])

  return { isLoading, userRoles, currentLineId, user }
}