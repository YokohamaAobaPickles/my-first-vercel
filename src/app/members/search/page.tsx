/**
 * Filename: src/app/members/search/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-04
 * Remarks :
 * V1.0.0 - 検索用ページ新規作成
 */

'use client'

import { useEffect, useState } from 'react'
import { fetchMembers } from '@/lib/memberApi'
import Link from 'next/link'
import type { Member } from '@/types/member'

import { useAuthCheck } from '@/hooks/useAuthCheck' // 管理者権限を取得するため
import { canManageMembers } from '@/utils/auth'     // 管理者権限を取得するため

export default function MemberSearchPage() {

  const [nickname, setNickname] = useState('')
  const [memberNumber, setMemberNumber] = useState('')
  const [email, setEmail] = useState('')

  const [members, setMembers] = useState<Member[]>([])
  const [results, setResults] = useState<Member[]>([])

  // 以下2つの定義は管理者権限取得用
  const { user, userRoles, isLoading } = useAuthCheck()
  const isAdmin = canManageMembers(userRoles)


  useEffect(() => {
    fetchMembers().then((res) => {
      if (res.success && res.data) {
        setMembers(res.data)
      }
    })
  }, [])

  const handleSearch = () => {
    const filtered = members.filter((m) => {

      // 一般会員は非公開プロフィールを除外
      if (!isAdmin && !m.is_profile_public) return false

      if (nickname && !m.nickname.includes(nickname)) return false
      if (memberNumber && m.member_number !== memberNumber) return false
      if (email && !m.email.includes(email)) return false

      return true
    })

    setResults(filtered)
  }

  // ローディング中と未ログイン時のガードを追加
  if (isLoading) return <div>読み込み中...</div>
  if (!user) return <div>ログインしてください。</div>

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          ニックネーム
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ padding: '8px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          会員番号
        </label>
        <input
          type="text"
          value={memberNumber}
          onChange={(e) => setMemberNumber(e.target.value)}
          style={{ padding: '8px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          メールアドレス
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', width: '100%' }}
        />
      </div>

      <button
        onClick={handleSearch}
        style={{
          padding: '10px 16px',
          backgroundColor: '#333',
          color: '#fff',
          borderRadius: '6px',
          border: '1px solid #555',
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        検索
      </button>

      <div style={{ marginTop: '24px' }}>
        <h2>検索結果</h2>

        {results.length === 0 && <p>検索結果はありません。</p>}

        {results.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: '12px',
              padding: '12px',
              border: '1px solid #444',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
            }}
          >
            <Link href={`/members/${m.id}`} style={{ color: '#8cf', fontSize: '16px' }}>
              {m.nickname}（{m.member_number || '番号なし'}）
            </Link>

            {/* 管理者だけ非公開フラグを表示（任意） */}
            {isAdmin && m.is_profile_public === false && (
              <span style={{ marginLeft: '8px', color: '#f88', fontSize: '12px' }}>
                非公開
              </span>
            )}
          </div>
        ))}
      </div>


    </div>
  )
}
