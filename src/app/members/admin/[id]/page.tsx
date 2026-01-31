/**
 * Filename: src/app/members/admin/[id]/page.tsx
 * Version : V2.4.4
 * Update  : 2026-02-01
 * Remarks : 
 * V2.4.4 - 修正：canManage の引数型を string | null | undefined に拡張し、
 * TS2345 エラーを解消。
 * V2.4.3 - 修正：認可ロジックの厳密化。
 */

'use client'

import {
  useState,
  useEffect,
  use,
  useCallback
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import {
  fetchMemberById,
  updateMember
} from '@/lib/memberApi'
import {
  Member,
  MEMBER_STATUS_LABELS,
  MEMBER_KIND_LABELS,
  ROLES
} from '@/types/member'

export default function MemberDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const router = useRouter()
  const { id } = use(params)
  const {
    user,
    isLoading: authLoading,
    userRoles
  } = useAuthCheck()

  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 引数の型を string | null | undefined に修正
  const canManage = useCallback((role: string | null | undefined) => {
    return (
      role === ROLES.SYSTEM_ADMIN ||
      role === ROLES.PRESIDENT ||
      role === ROLES.VICE_PRESIDENT ||
      role === ROLES.MEMBER_MANAGER
    )
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (
      !user ||
      !canManage(userRoles)
    ) {
      router.replace('/members/profile')
      return
    }

    async function load() {
      try {
        const res = await fetchMemberById(id)
        if (
          res.success &&
          res.data
        ) {
          setMember(res.data)
        }
      } catch (error) {
        console.error('Failed to load member:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [
    id,
    authLoading,
    user,
    userRoles,
    router,
    canManage
  ])

  const handleSave = async (updatedFields: Partial<Member>) => {
    if (!member) return
    setSaving(true)
    const res = await updateMember(member.id, updatedFields)
    if (res.success) {
      const updated = await fetchMemberById(id)
      if (updated.data) {
        setMember(updated.data)
      }
      alert('更新しました')
    }
    setSaving(false)
  }

  const handleApproveWithdrawal = async () => {
    if (!member) return
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const newEmail = `${member.email}_withdrawn_${today}`
    await handleSave({
      status: 'withdrawn',
      email: newEmail,
      retire_date: new Date().toISOString()
    })
  }

  const handleReject = async () => {
    if (
      !member ||
      !confirm('本当に拒否/強制退会させますか？')
    ) {
      return
    }
    await handleSave({
      status: 'rejected',
      reject_date: new Date().toISOString()
    })
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <div style={loadingStyle}>
        Loading...
      </div>
    )
  }

  if (
    !canManage(userRoles) ||
    !member
  ) {
    return null
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        会員詳細: {member.name}
      </h1>
      <p style={statusTextStyle}>
        ステータス: {MEMBER_STATUS_LABELS[member.status]}
      </p>

      <div style={formWrapperStyle}>
        <label style={labelStyle}>
          氏名（漢字）:
          <input
            type="text"
            defaultValue={member.name}
            aria-label="氏名（漢字）"
            onChange={(e) => setMember({
              ...member,
              name: e.target.value
            })}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          ローマ字:
          <input
            type="text"
            defaultValue={member.name_roma}
            aria-label="ローマ字"
            onChange={(e) => setMember({
              ...member,
              name_roma: e.target.value
            })}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          生年月日:
          <input
            type="date"
            defaultValue={member.birthday || ''}
            aria-label="生年月日"
            onChange={(e) => setMember({
              ...member,
              birthday: e.target.value
            })}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          会員種別:
          <select
            defaultValue={member.member_kind}
            aria-label="会員種別"
            onChange={(e) => setMember({
              ...member,
              member_kind: e.target.value
            })}
            style={inputStyle}
          >
            {Object.entries(MEMBER_KIND_LABELS).map(([k, v]) => (
              <option
                key={k}
                value={k}
              >
                {v}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => handleSave(member)}
          disabled={saving}
          style={saveButtonStyle}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <hr style={hrStyle} />

      <div style={actionAreaStyle}>
        {member.status === 'withdraw_req' && (
          <button
            onClick={handleApproveWithdrawal}
            style={approveButtonStyle}
          >
            退会を承認
          </button>
        )}

        <button
          onClick={handleReject}
          style={rejectButtonStyle}
        >
          強制退会
        </button>
      </div>

      <button
        onClick={() => router.back()}
        style={backButtonStyle}
      >
        戻る
      </button>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  padding: '40px',
  color: 'white',
  backgroundColor: 'black',
  minHeight: '100vh'
}

const loadingStyle: React.CSSProperties = {
  color: 'white',
  padding: '40px'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  marginBottom: '10px'
}

const statusTextStyle: React.CSSProperties = {
  marginBottom: '20px',
  color: '#ccc'
}

const formWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
}

const inputStyle: React.CSSProperties = {
  padding: '8px',
  color: 'black',
  borderRadius: '4px',
  border: '1px solid #ccc',
  maxWidth: '300px'
}

const saveButtonStyle: React.CSSProperties = {
  width: '120px',
  marginTop: '10px',
  padding: '10px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
}

const hrStyle: React.CSSProperties = {
  margin: '40px 0',
  borderColor: '#333'
}

const actionAreaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px'
}

const approveButtonStyle: React.CSSProperties = {
  backgroundColor: 'orange',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer'
}

const rejectButtonStyle: React.CSSProperties = {
  backgroundColor: 'red',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer'
}

const backButtonStyle: React.CSSProperties = {
  display: 'block',
  marginTop: '40px',
  color: '#888',
  background: 'none',
  border: 'none',
  cursor: 'pointer'
}