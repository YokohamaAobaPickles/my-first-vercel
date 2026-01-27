/**
 * Filename: src/app/members/admin/[id]/page.tsx
 * Version : V1.3.0
 * Update  : 2026-01-26
 * 履歴:
 * V1.3.0 - memberApi (fetchMemberById, updateMemberStatus) を使用し実データ連携。
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { fetchMemberById, updateMemberStatus } from '@/lib/memberApi'

export default function MemberDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { user, isLoading } = useAuthCheck()
  const [member, setMember] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user || !canManageMembers(user.roles)) {
      router.replace('/')
      return
    }

    const loadData = async () => {
      const data = await fetchMemberById(id as string)
      setMember(data)
    }
    loadData()
  }, [user, isLoading, id, router])

  const handleApprove = async () => {
    if (!confirm('この会員を承認しますか？')) return
    setIsProcessing(true)
    const result = await updateMemberStatus(id as string, 'active')
    if (result.success) {
      alert('会員を承認しました。')
      router.replace('/members/admin')
    } else {
      alert('エラーが発生しました。')
    }
    setIsProcessing(false)
  }

  if (isLoading || !member) return <div style={{padding:'40px', color:'#fff'}}>読み込み中...</div>

  return (
    <div style={{ padding: '40px', backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>会員詳細: {member.name}</h1>
      <p>ステータス: {member.status}</p>
      {member.status === 'registration_request' && (
        <button onClick={handleApprove} disabled={isProcessing} style={{ padding: '10px 20px', backgroundColor: '#52c41a', color: '#fff', cursor: 'pointer' }}>
          {isProcessing ? '処理中...' : '承認する'}
        </button>
      )}
      <button onClick={() => router.back()} style={{ display: 'block', marginTop: '20px', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>戻る</button>
    </div>
  )
}