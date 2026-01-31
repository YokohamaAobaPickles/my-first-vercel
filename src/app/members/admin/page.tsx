/**
 * Filename: src/app/members/admin/page.tsx
 * Version : V2.1.5
 * Update  : 2026-01-31
 * Remarks : 
 * V2.1.5 - 修正：Vitestパス（0001完全一致）と実機動作（権限ガード）の両立。
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
import {
  fetchMembers,
  deleteMember
} from '@/lib/memberApi'
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
    if (res.success && res.data) {
      setMembers(res.data)
    }
    setIsDataFetching(false)
  }

  useEffect(() => {
    // 認証情報が確定するまで待つ
    if (isAuthLoading) return

    // ユーザーが存在し、かつ権限判定が可能な状態（userRolesがある）になってからチェック
    if (user && userRoles) {
      if (!canManageMembers(userRoles)) {
        router.replace('/members/profile')
        return
      }
      loadData()
    } else if (!user && !isAuthLoading) {
      // 完全に未ログインなら戻す
      router.replace('/members/profile')
    }
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
  }, [members, filterStatus])

  const handleQuickDelete = async (id: string, name: string) => {
    if (!confirm(`${name} さんのデータを削除しますか？`)) return
    const res = await deleteMember(id)
    if (res.success) {
      alert('削除しました')
      loadData()
    }
  }

  // 認証中またはデータ取得中は「読み込み中」を表示して真っ黒を回避
  if (isAuthLoading || (isDataFetching && members.length === 0)) {
    return (
      <div style={loadingContainerStyle}>
        読み込み中...
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        会員管理ダッシュボード
      </h1>

      <div style={toolbarStyle}>
        <label htmlFor="statusFilter" style={labelStyle}>
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
            <option key={value} value={value}>{label}</option>
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
              <div key={m.id} style={cardStyle}>
                <div style={infoStyle}>
                  <div>
                    <div style={nameStyle}>
                      {/* テストが findByText('0001') で通るように分離 */}
                      {m.member_number && (
                        <span style={{ marginRight: '8px' }}>
                          {m.member_number.toString().padStart(4, '0')}
                        </span>
                      )}
                      <span>{m.name}</span>
                    </div>
                    <div style={statusBadgeStyle(m.status)}>
                      {MEMBER_STATUS_LABELS[m.status]}
                    </div>
                  </div>
                </div>
                <div style={actionAreaStyle}>
                  <Link
                    href={`/members/admin/${m.id}`}
                    style={detailLinkStyle}
                  >
                    詳細
                  </Link>
                  <button
                    onClick={() => handleQuickDelete(m.id, m.name)}
                    style={deleteBtnStyle}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={footerNavStyle}>
        <Link href="/members/profile" style={backLinkStyle}>
          自分のプロフィールに戻る
        </Link>
      </div>
    </div>
  )
}

// --- Styles (80カラム対応・定義ごとに改行) ---

const containerStyle: React.CSSProperties = {
  padding: '40px 20px',
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  maxWidth: '800px',
  margin: '0 auto',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  marginBottom: '40px',
  textAlign: 'center',
  fontWeight: 'bold',
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
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #555',
}

const emptyMessageStyle: React.CSSProperties = {
  color: '#888',
  textAlign: 'center',
  padding: '40px 0',
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: '#1a1a1a',
  borderRadius: '10px',
  border: '1px solid #333',
}

const infoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
}

const nameStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 'bold',
}

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  fontSize: '0.75rem',
  marginTop: '4px',
  color: status === 'active' ? '#4caf50' : 
         status === 'new_req' ? '#ff4d4f' : '#888',
})

const actionAreaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '15px',
}

const detailLinkStyle: React.CSSProperties = {
  color: '#00d1ff',
  textDecoration: 'none',
  fontSize: '0.9rem',
}

const deleteBtnStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#ff4d4f',
  cursor: 'pointer',
  fontSize: '0.9rem',
}

const footerNavStyle: React.CSSProperties = {
  marginTop: '40px',
  textAlign: 'center',
}

const backLinkStyle: React.CSSProperties = {
  color: '#888',
  textDecoration: 'none',
  fontSize: '0.9rem',
}

const loadingContainerStyle: React.CSSProperties = {
  padding: '100px 20px',
  backgroundColor: '#000',
  color: '#fff',
  textAlign: 'center',
  minHeight: '100vh',
}