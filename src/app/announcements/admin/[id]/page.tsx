/**
 * Filename: announcements/admin/[id]/page.tsx
 * Version : V1.4.0
 * Update  : 2026-01-25
 * 内容：
 * V1.4.0
 * - PCユーザー（line_idカラムにemailが入っている場合）の名前表示に対応
 * - 結合ロジックの不備（外部結合）をアプリ側で補完
 * V1.3.0
 * - @/hooks/useAuthCheckに対応
 * V1.1.0 ~ V1.2.0
 * - デザインをダークモードに変更、ニックネーム表示に変更
 */

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementReadDetailPage() {
  const { id } = useParams()
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck()
  const [readers, setReaders] = useState<any[]>([])

  useEffect(() => {
    if (isAuthLoading || !canManageAnnouncements(userRoles)) return

    const fetchReaders = async () => {
      // 1. 既読データを取得
      const { data: reads } = await supabase
        .from('announcement_reads')
        .select('read_at, line_id')
        .eq('announcement_id', id)
        .order('read_at', { ascending: false })
      
      if (!reads) return

      // 2. 既読者の詳細情報を取得 (line_id が LINE ID か Email かに関わらずマッチさせる)
      const { data: members } = await supabase
        .from('members')
        .select('line_id, email, name, nickname')

      // アプリ側でマッピング（DB結合で漏れるPCユーザーを救済）
      const combinedData = reads.map(r => {
        const member = members?.find(m => 
          m.line_id === r.line_id || m.email === r.line_id
        )
        return {
          read_at: r.read_at,
          name: member?.name || '不明なユーザー',
          nickname: member?.nickname || 'ゲスト',
          is_pc: !member?.line_id
        }
      })

      setReaders(combinedData)
    }
    fetchReaders()
  }, [isAuthLoading, userRoles, id])

  if (isAuthLoading) return <div style={containerStyle}>読み込み中...</div>

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/announcements/admin" style={backLinkStyle}>
          ← 管理パネルに戻る
        </Link>
      </div>

      <h3 style={titleStyle}>既読ユーザー一覧</h3>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>氏名 (ニックネーム)</th>
              <th style={thRightStyle}>既読日時</th>
            </tr>
          </thead>
          <tbody>
            {readers.map((r, i) => (
              <tr key={i} style={rowStyle}>
                <td style={tdStyle}>
                  {r.nickname} ({r.name})
                  {r.is_pc && <span style={pcBadgeStyle}>PC</span>}
                </td>
                <td style={tdRightStyle}>
                  {new Date(r.read_at).toLocaleString('ja-JP', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// スタイル定義
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto'
}

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  margin: '20px 0',
  borderLeft: '4px solid #0070f3',
  paddingLeft: '12px'
}

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: '#111',
  borderRadius: '10px',
  border: '1px solid #222',
  overflow: 'hidden'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
}

const headerRowStyle: React.CSSProperties = {
  borderBottom: '2px solid #222',
  backgroundColor: '#1a1a1a'
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '15px',
  fontSize: '0.85rem',
  color: '#888'
}

const thRightStyle: React.CSSProperties = {
  ...thStyle,
  textAlign: 'right'
}

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #222'
}

const tdStyle: React.CSSProperties = {
  padding: '15px',
  fontSize: '0.95rem'
}

const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
  fontSize: '0.85rem',
  color: '#aaa'
}

const pcBadgeStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  backgroundColor: '#333',
  color: '#aaa',
  padding: '2px 4px',
  borderRadius: '3px',
  marginLeft: '8px',
  verticalAlign: 'middle'
}