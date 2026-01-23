/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.4.0
 * Update: 2026-01-23
 * 内容：
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })

        // 1. 未ログイン時の振り分け
        if (!liff.isLoggedIn()) {
          if (liff.isInClient()) {
            // LINEアプリ内なら、自動的にLINEログイン画面へ
            liff.login()
          } else {
            // PCブラウザ等の場合、自前のログイン・登録画面へ誘導
            if (pathname !== '/members/login') {
              router.replace('/members/login')
            }
          }
          // 未ログイン時はここで確実に終了させる
          setIsLoading(false)
          return 
        }

        // 2. ログイン済みの処理 (ここに来る = liff.isLoggedIn() は true)
        const profile = await liff.getProfile()
        setCurrentLineId(profile.userId)

        const { data: member, error } = await supabase
          .from('members')
          .select('line_id, roles, status')
          .eq('line_id', profile.userId)
          .single()

        if (member) {
          // 登録済み：ロールをセット
          setUserRoles(member.roles)
        } else {
          // 未登録（LINEログインはしてるがDBにない）：登録画面へ
          if (pathname !== '/members/login') {
            router.replace('/members/login')
          }
        }

      } catch (err) {
        console.error('Auth Check Error:', err)
        // 重大なエラー（LIFF初期化失敗等）でも、PCなら自前画面へ逃がす
        if (pathname !== '/members/login') {
          router.replace('/members/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [router, pathname]) // 依存配列に router と pathname を含め、パス変更時に再チェック

  return { isLoading, userRoles, currentLineId }
}