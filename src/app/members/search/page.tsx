'use client'

/**
 * Filename: src/app/members/search/page.tsx
 * Version : V1.1.0
 * Update  : 2026-02-04
 * Remarks :
 * V1.0.0 - 検索用ページ新規作成
 * V1.1.0 - プロフィールページと同じレイアウト構造に統一
 */

import { useEffect, useState } from 'react'
import { fetchMembers } from '@/lib/memberApi'
import Link from 'next/link'
import type { Member } from '@/types/member'

import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'

// プロフィールページと同じ styles を import
import { styles } from '@/types/styles'

export default function MemberSearchPage() {
  const [nickname, setNickname] = useState('')
  const [memberNumber, setMemberNumber] = useState('')
  const [email, setEmail] = useState('')

  const [members, setMembers] = useState<Member[]>([])
  const [results, setResults] = useState<Member[]>([])

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
      if (!isAdmin && !m.is_profile_public) return false

      if (nickname && !m.nickname.includes(nickname)) return false
      if (memberNumber && m.member_number !== memberNumber) return false
      if (email && !m.email.includes(email)) return false

      return true
    })

    setResults(filtered)
  }

  if (isLoading) return <div>読み込み中...</div>
  if (!user) return <div>ログインしてください。</div>

  return (
    <div style={styles.container}>
      <div style={styles.content}>

        {/* ヘッダー */}
        <div style={styles.header}>
          <h1 style={styles.title}>会員検索</h1>
        </div>

        {/* --- 検索フォーム --- */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>検索条件</h2>
          </div>

          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>ニックネーム</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>会員番号</span>
              <input
                type="text"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.infoRowLast}>
              <span style={styles.label}>メールアドレス</span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <button onClick={handleSearch} style={styles.searchButton}>
              検索
            </button>
          </div>
        </section>

        {/* --- 検索結果 --- */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>検索結果</h2>
          </div>

          {results.length === 0 && (
            <p style={{ padding: '12px' }}>検索結果はありません。</p>
          )}

          {results.map((m) => (
            <div key={m.id} style={styles.card}>
              <div style={styles.infoRow}>
                <span style={styles.label}>ニックネーム</span>
                <span style={styles.value}>{m.nickname}</span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.label}>会員番号</span>
                <span style={styles.value}>{m.member_number || '-'}</span>
              </div>

              <div style={styles.infoRowLast}>
                <Link href={`/members/${m.id}`} style={styles.editButtonSmall}>
                  詳細を見る
                </Link>

                {isAdmin && m.is_profile_public === false && (
                  <span style={{ marginLeft: '8px', color: '#f88' }}>
                    非公開
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}
