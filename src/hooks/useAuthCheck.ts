/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.7.0
 * Update  : 2026-01-25
 * 内容：
 * V1.7.0
 * - PCログイン済みの場合、LIFFの処理を完全にバイパスして400エラーを防止
 * - 非同期処理の順序を整理し、セッション判定を厳格化
 * V1.6.0
 * - PCブラウザでのログイン後、LIFFによる400エラーを防ぐガードを追加
 * V1.5.0
 * - 戻り値に user を追加。PCユーザーの既読判定用。
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
        // 1. Supabaseのセッションをチェック（PCログイン・メール認証済みか）
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
            return // ★ここで終了：PCユーザーならLIFFを初期化しない
          }
        }

        // 2. LINEアプリ内、またはLIFFが必要な環境かチェック
        // PCブラウザでセッションがない場合も一旦ここへ来るが、
        // ログイン画面へ飛ばす前にLIFF初期化を試みる
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })

        if (!liff.isLoggedIn()) {
          if (liff.isInClient()) {
            liff.login()
          } else if (pathname !== '/members/login') {
            router.replace('/members/login')
          }
          setIsLoading(false)
          return 
        }

        // 3. LINEログイン済みの処理
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

      } catch (err) {
        console.error('Auth Check Error:', err)
        // エラー時はPCログイン画面へ
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