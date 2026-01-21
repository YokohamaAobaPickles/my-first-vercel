'use client' // ブラウザで動くプログラムであることを宣言

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { supabase } from '../../lib/supabase'

export default function LinePage() {
  const [profile, setProfile] = useState<any>(null)
  const [status, setStatus] = useState('初期化中...')

  useEffect(() => {
    const initLiff = async () => {
      try {
        // 1. LIFFの初期化
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })

        // 2. ログインチェック
        if (!liff.isLoggedIn()) {
          // ログインしていなければLINEログインへ
          // ログイン後に、今いるこのページ（/line）に戻ってくるように指定する
          liff.login({ redirectUri: 'https://my-first-vercel-tyxu.vercel.app/line' })
          return
        }

        // 3. LINEのプロフィール取得
        const lineProfile = await liff.getProfile()
        setProfile(lineProfile)
        setStatus('照合中...')

        // 4. Supabaseでユーザー照合
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('line_user_id', lineProfile.userId)
          .single()

        if (error && error.code === 'PGRST116') {
          // データが見つからない場合（新規登録）
          setStatus('初めまして！情報を登録しています...')
          await supabase.from('profiles').insert([
            {
              line_user_id: lineProfile.userId,
              display_name: lineProfile.displayName,
            },
          ])
          setStatus('登録完了しました！')
        } else if (data) {
          // データがある場合
          setStatus(`${data.display_name} さん、おかえりなさい！`)
        }

      } catch (err) {
        console.error(err)
        setStatus('エラーが発生しました')
      }
    }

    initLiff()
  }, [])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>LINE 連携テスト</h1>
      <hr />
      <p><strong>ステータス:</strong> {status}</p>
      {profile && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <p>LINE名: {profile.displayName}</p>
          <img src={profile.pictureUrl} alt="icon" style={{ width: '80px', borderRadius: '50%' }} />
        </div>
      )}
    </div>
  )
}