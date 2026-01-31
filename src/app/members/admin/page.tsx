/**
 * Filename: src/app/members/admin/page.tsx
 * Version : V2.2.0
 * Update  : 2026-02-01
 * Remarks :
 * V2.2.0 - 修正：テストV2.1.1に合わせ会員番号表示とリダイレクト先を修正。
 * V2.1.0 - 機能追加：全会員一覧表示、ステータスフィルタ、クイック削除。
 * V2.0.0 - 変更：fetchPendingMembers から fetchMembers への移行。
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
  MEMBER_STATUS_LABELS,
  ROLES
} from '@/types/member'

export default function AdminDashboard() {
  const router = useRouter()
  const {
    user,
    isLoading: isAuthLoading,
    userRoles
  } = useAuthCheck()

  const [members, setMembers] = useState<Member[]>([])
  const [filterStatus, setFilterStatus] = useState<MemberStatus | 'all'>('all')
  const [isDataFetching, setIsDataFetching] = useState(true)

  const loadData = async () => {
    setIsDataFetching(true)
    try {
      const res = await fetchMembers()
      // resの存在確認を行い、undefinedエラーを防ぐ
      if (res && res.success && res.data) {
        setMembers(res.data)
      }
    } catch (error) {
      console.error('Data load error:', error)
    } finally {
      setIsDataFetching(false)
    }
  }

useEffect(() => {
    if (isAuthLoading) return

    // デバッグログを入れておくと、実際のロールを確認できて安心です
    console.log('Current User Role:', userRoles);

    if (
      !user || 
      !canManageMembers(userRoles) // ROLES.SYSTEM_ADMIN 直接指定ではなく、関数で判定
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

  const handleQuickDelete = async (
    id: string,
    name: string
  ) => {
    if (
      !confirm(`${name} さんの全データを削除しますか？\nこの操作は戻せません。`)
    ) {
      return
    }

    const res = await deleteMember(id)
    if (res.success) {
      alert('削除しました')
      loadData()
    } else {
      alert('エラー: ' + res.error?.message)
    }
  }

  // クライアントサイドフィルタリング
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (filterStatus === 'all') return true
      return m.status === filterStatus
    })
  }, [members, filterStatus])

  // 会員番号を4桁にフォーマットする関数
  const formatMemberNumber = (num?: number | string | null) => {
    return String(num || 0).padStart(4, '0')
  }

  if (
    isAuthLoading || 
    isDataFetching
  ) {
    return (
      <div style={loadingContainerStyle}>
        読み込み中...
      </div>
    )
  }

  // 権限がない場合は描画しない
  if (userRoles !== ROLES.SYSTEM_ADMIN) return null

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        会員管理ダッシュボード
      </h1>

      <div style={toolbarStyle}>
        <label
          htmlFor="statusFilter"
          style={labelStyle}
        >
          ステータスで絞り込み:
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
            対象の会員は見つかりませんでした。
          </p>
        ) : (
          <div style={listStyle}>
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                style={cardStyle}
              >
                <div style={infoStyle}>
                  <div style={numberStyle}>
                    {formatMemberNumber(m.member_number)}
                  </div>
                  <div>
                    <div style={nameStyle}>
                      {m.name}
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
                    詳細・編集
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

// --- Styles ---

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
  marginBottom: '30px',
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
  border: '1px solid #333',
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
  border: '1px solid #222',
}

const infoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
}

const numberStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontFamily: 'monospace',
  color: '#888',
  backgroundColor: '#222',
  padding: '2px 6px',
  borderRadius: '4px',
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
  padding: '40px',
  color: '#fff',
  textAlign: 'center',
}