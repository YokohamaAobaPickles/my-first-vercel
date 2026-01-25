/**
 * Filename: hooks/useAuthCheck.ts
 * Version : V1.6.0
 * Update  : 2026-01-25
 * 内容：
 * V1.6.0
 * - PCブラウザでのログイン後、LIFFによる400エラーを防ぐガードを追加
 * - Supabaseセッションがある場合はLIFF初期化をスキップまたは限定化
 * V1.5.0
 * - 戻り値に user (DBレコード全体) を追加。PCユーザーの既読判定用。
 * V1.4.0
 * - PCブラウザ時のリダイレクトガードを強化
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
        // 1. まずSupabaseのセッションがあるか（PCログイン済みか）確認
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // PCユーザーとしてログイン済みの場合
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
            return // LINEの処理へ行かずに終了
          }
        }

        // 2. LINEアプリ内、またはLINEログインの処理
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

        // LINEログイン済みのプロフィール取得
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