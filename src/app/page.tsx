/**
 * Filename: members/page.tsx
 * Version : V1.2.1
 * Update  : 2026-01-21 
 * 修正内容：
 * V1.2.1
 * - JSXのタグ構造ミスを修正
 * V1.2.0
 * - canManagementMembers ユーティリティを使用して管理者メニューを表示
 * V1.1.0
 * - プロファイルの表示
 * - membersテーブルからLINE IDをキーに会員情報を取得
 * - 氏名、会員種別、役割、ステータスの表示に対応
 */

'use client'
import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageMembers } from '@/utils/auth'

type Member = {
  name: string
  nickname: string
  member_kind: string
  roles: string
  status: string
  member_number: string
}

export default function ProfilePage() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }

        const liffProfile = await liff.getProfile()

        const { data, error } = await supabase
          .from('members')
          .select('name, nickname, member_kind, roles, status, member_number')
          .eq('line_id', liffProfile.userId)
          .single()

        if (error) {
          console.error('Supabase Error:', error)
          setErrorMsg('会員情報が見つかりませんでした。事務局へお問い合わせください。')
        } else {
          setMember(data)
        }
      } catch (err) {
        console.error('LIFF Error:', err)
        setErrorMsg('プロフィールの取得に失敗しました。')
      } finally {
        setLoading(false)
      }
    }
    fetchMemberData()
  }, [])

  if (loading) return <div style={{ padding: '20px' }}>読み込み中...</div>

  if (errorMsg) return (
    <div style={{ padding: '20px', color: 'red' }}>
      {errorMsg}
      <br /><br />
      <Link href="/announcements">お知らせへ戻る</Link>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>マイページ</h1>

      <div style={{
        border: '1px solid #eee',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.8rem', color: '#888' }}>氏名</label>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{member?.name} ({member?.nickname})</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>会員番号</label>
            <div>{member?.member_number || '未発行'}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>会員種別</label>
            <div>{member?.member_kind}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>役割</label>
            <div>{member?.roles}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>ステータス</label>
            <div>
              <span style={{
                color: member?.status === 'active' ? 'green' : 'orange',
                fontWeight: 'bold'
              }}>
                {member?.status === 'active' ? '有効' : member?.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 管理者用メニュー：canManageMembersがtrueの時だけ表示される */}
      {canManageMembers(member?.roles || null) && (
        <div style={{
          padding: '15px',
          backgroundColor: 'black',
          border: '1px solid #ffe58f',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ fontWeight: 'bold', color: '#856404', marginTop: 0 }}>管理者メニュー</p>
          <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
            <li>
              <Link href="/members/admin" style={{ color: '#0070f3' }}>
                会員管理（準備中）
              </Link>
              <br></br>
              <Link href="/announcements/admin" style={{ color: '#118e71' }}>
                お知らせ管理
              </Link>
              {/*
              <Link href="/announcements/new" style={{ color: '#0070f3' }}>
                お知らせを新規作成する
              </Link>
              */}
            </li>
          </ul>
        </div>
      )}

      <div>
        <Link href="/announcements" style={{ color: '#666' }}>お知らせ一覧へ</Link>
      </div>
    </div>
  )
}