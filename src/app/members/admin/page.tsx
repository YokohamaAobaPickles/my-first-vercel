/**
 * Filename: src/app/members/admin/page.tsx
 * Version : V2.2.1
 * Update  : 2026-02-01
 * Remarks : 
 * V2.2.1 - 確定：会員番号・ニックネーム・氏名の三点表示。
 * 削除機能をエキストラ管理へ完全分離。
 */

'use client'

import React, {
  useEffect,
  useState,
  useMemo
} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { fetchMembers } from '@/lib/memberApi'
import {
  Member,
  MemberStatus,
  MEMBER_STATUS_LABELS
} from '@/types/member'

export default function AdminDashboard() {
  const router = useRouter()
  const {
    user,
    userRoles,
    isLoading: isAuthLoading
  } = useAuthCheck()

  const [members, setMembers] = useState<Member[]>([])
  const [filterStatus, setFilterStatus] = useState<MemberStatus | 'all'>('all')
  const [isDataFetching, setIsDataFetching] = useState(true)

  const loadData = async () => {
    setIsDataFetching(true)
    const res = await fetchMembers()
    if (
      res.success && 
      res.data
    ) {
      setMembers(res.data)
    }
    setIsDataFetching(false)
  }

  useEffect(() => {
    if (isAuthLoading) return

    if (
      !user || 
      !userRoles || 
      !canManageMembers(userRoles)
    ) {
      router.replace('/members/profile')
      return
    }
    loadData()
  }, [
    user,
    userRoles,
    isAuthLoading,
    router
  ])

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (filterStatus === 'all') return true
      return m.status === filterStatus
    })
  }, [
    members,
    filterStatus
  ])

  if (
    isAuthLoading || 
    (isDataFetching && members.length === 0)
  ) {
    return (
      <div style={loadingContainerStyle}>
        読み込み中...
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          会員管理パネル
        </h1>
        <Link
          href="/admin/extra"
          style={extraButtonStyle}
        >
          エキストラ管理
        </Link>
      </header>

      <div style={toolbarStyle}>
        <label
          htmlFor="statusFilter"
          style={labelStyle}
        >
          表示フィルタ:
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={selectStyle}
        >
          <option value="all">全員表示</option>
          {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
      </div>

      <section style={sectionStyle}>
        {filteredMembers.length === 0 ? (
          <p style={emptyMessageStyle}>
            対象の会員はいません。
          </p>
        ) : (
          <div style={listStyle}>
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                style={cardStyle}
              >
                <div style={infoStyle}>
                  <div style={memberNumStyle}>
                    {m.member_number ? 
                      m.member_number.toString().padStart(4, '0') : '----'}
                  </div>
                  <div style={nameGroupStyle}>
                    <div style={nicknameStyle}>
                      {m.nickname || '(未設定)'}
                    </div>
                    <div style={realNameStyle}>
                      {m.name}
                    </div>
                  </div>
                </div>
                
                <div style={actionAreaStyle}>
                  <div style={statusBadgeStyle(m.status)}>
                    {MEMBER_STATUS_LABELS[m.status]}
                  </div>
                  <Link
                    href={`/members/admin/${m.id}`}
                    style={detailLinkStyle}
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={footerNavStyle}>
        <Link
          href="/members/profile"
          style={backLinkStyle}
        >
          自分のプロフィールに戻る
        </Link>
      </div>
    </div>
  )
}

// --- Styles (定義ごとに改行・80カラム対応) ---

const containerStyle: React.CSSProperties = {
  padding: '40px 20px',
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  maxWidth: '800px',
  margin: '0 auto',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  margin: 0,
}

const extraButtonStyle: React.CSSProperties = {
  backgroundColor: '#222',
  color: '#aaa',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  textDecoration: 'none',
  border: '1px solid #444',
}

const toolbarStyle: React.CSSProperties = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#aaa',
}

const selectStyle: React.CSSProperties = {
  backgroundColor: '#111',
  color: '#fff',
  border: '1px solid #333',
  padding: '8px',
  borderRadius: '6px',
}

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #222',
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#181818',
  borderRadius: '8px',
  border: '1px solid #282828',
}

const infoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const memberNumStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '1rem',
  color: '#00d1ff',
  width: '45px',
}

const nameGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const nicknameStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
}

const realNameStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#888',
}

const actionAreaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
}

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  fontSize: '0.7rem',
  padding: '2px 8px',
  borderRadius: '4px',
  backgroundColor: '#222',
  color: status === 'active' ? '#4caf50' : 
         status === 'new_req' ? '#ff4d4f' : '#aaa',
})

const detailLinkStyle: React.CSSProperties = {
  color: '#00d1ff',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 'bold',
}

const footerNavStyle: React.CSSProperties = {
  marginTop: '40px',
  textAlign: 'center',
}

const backLinkStyle: React.CSSProperties = {
  color: '#666',
  textDecoration: 'none',
  fontSize: '0.85rem',
}

const emptyMessageStyle: React.CSSProperties = {
  color: '#555',
  textAlign: 'center',
  padding: '40px 0',
}

const loadingContainerStyle: React.CSSProperties = {
  padding: '100px 20px',
  textAlign: 'center',
  color: '#fff',
}