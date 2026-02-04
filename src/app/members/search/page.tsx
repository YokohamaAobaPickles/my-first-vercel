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
import { fetchMembersByQuery } from '@/lib/memberApi'
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

  //const [results, setResults] = useState<Member[]>([])
  const [results, setResults] = useState<Member[] | null>(null)

  const { user, userRoles, isLoading } = useAuthCheck()
  const isAdmin = canManageMembers(userRoles)

  const handleSearch = async () => {
    const res = await fetchMembersByQuery(nickname, memberNumber, email)

    if (!res.success || !res.data) {
      setResults([])
      return
    }

    // 権限チェックは UI 側で継続
    const filtered = res.data.filter((m) => {
      if (!isAdmin && !m.is_profile_public) return false
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

            {/* ニックネーム */}
            <div style={styles.infoRow}>
              <label htmlFor="nickname" style={styles.label}>ニックネーム</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* 会員番号 */}
            <div style={styles.infoRow}>
              <label htmlFor="memberNumber" style={styles.label}>会員番号</label>
              <input
                id="memberNumber"
                type="text"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* メールアドレス */}
            <div style={styles.infoRowLast}>
              <label htmlFor="email" style={styles.label}>メールアドレス</label>
              <input
                id="email"
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

          {results !== null && results.length === 0 && (
            <p style={{ padding: '12px' }}>該当する会員が見つかりません</p>
          )}

          {results !== null && results.length > 0 && results.map((m) => (
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

        {/* フッター：プロフィールに戻る */}
        <div style={styles.footer}>
          <Link href="/members/profile" style={styles.logoutLink}>
            プロファイルに戻る
          </Link>
        </div>

      </div>
    </div>
  )
}
