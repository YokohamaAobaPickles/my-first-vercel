/**
 * Filename: src/app/members/[id]/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-04
 * Remarks :
 * V1.0.0 - プロファイル検索結果詳細ページ
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { fetchMemberById } from '@/lib/memberApi'
import type { Member } from '@/types/member'

import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { styles } from '@/types/styles'

export default function MemberDetailPage() {
  const { id } = useParams()
  const [member, setMember] = useState<Member | null>(null)
  const [notFound, setNotFound] = useState(false)

  const { user, userRoles, isLoading } = useAuthCheck()
  const isAdmin = canManageMembers(userRoles)

  useEffect(() => {
    if (!id) return

    fetchMemberById(id as string).then((res) => {
      if (!res.success || !res.data) {
        setNotFound(true)
        return
      }
      setMember(res.data)
    })
  }, [id])

  if (isLoading) return <div>読み込み中...</div>
  if (!user) return <div>ログインしてください。</div>
  if (notFound) return <div>会員が見つかりません。</div>
  if (!member) return <div>読み込み中...</div>

  // 一般会員は非公開プロフィールを見れない
  if (!isAdmin && member.is_profile_public === false) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h2>この会員のプロフィールは非公開です。</h2>
          <Link href="/members/search" style={styles.logoutLink}>
            検索に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>

        {/* ヘッダー */}
        <div style={styles.header}>
          <h1 style={styles.title}>会員詳細</h1>

        </div>

        {/* 基本情報 */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>基本情報</h2>
          </div>

          <div style={styles.card}>
            {[
              { label: '会員番号', value: member.member_number || '-' },
              { label: 'ニックネーム', value: member.nickname },
              { label: 'メールアドレス', value: member.email },
              { label: '氏名', value: member.name },
              { label: '氏名（ローマ字）', value: member.name_roma },
              { label: '性別', value: member.gender || '-' },
              { label: '生年月日', value: member.birthday || '-' },
              { label: '会員種別', value: member.member_kind },
              { label: '役職', value: member.roles },
              { label: 'ステータス', value: member.status },
            ].map((item, idx) => (
              <div
                key={idx}
                style={idx === 9 ? styles.infoRowLast : styles.infoRow}
              >
                <span style={styles.label}>{item.label}</span>
                <span style={styles.value}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* プロフィール情報 */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>プロフィール</h2>
          </div>

          <div style={styles.card}>
            <div style={styles.infoRow}>
              <span style={styles.label}>郵便番号</span>
              <span style={styles.value}>{member.postal || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>住所</span>
              <span style={styles.value}>{member.address || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>電話番号</span>
              <span style={styles.value}>{member.tel || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>プロフィールメモ</span>
              <span style={styles.value}>{member.profile_memo || '-'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>緊急連絡先電話</span>
              <span style={styles.value}>{member.emg_tel || '-'}</span>
            </div>
            <div style={styles.infoRowLast}>
              <span style={styles.label}>続柄</span>
              <span style={styles.value}>{member.emg_rel || '-'}</span>
            </div>
          </div>
        </section>

        <Link href="/members/search" style={styles.logoutLink}>
          検索に戻る
        </Link>

      </div>
    </div>
  )
}
