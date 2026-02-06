/**
 * Filename: src/app/members/extra/dupr/page.tsx
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks :
 * V1.0.1 - ファイル位置をsrc/app/members/extra/duprに移動 
 * V1.0.0 - DUPR一括登録。ファイルアップロードで members の DUPR 関連カラムを更新する。
 */

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { fetchMemberByDuprId, updateMember } from '@/lib/memberApi'
import { parseDuprBulkFile, type DuprBulkRow } from '@/utils/duprBulkParser'

/** members テーブルの DUPR 関連カラム（db_members_scheme に基づく） */
const DUPR_UPDATE_COLUMNS = [
  'dupr_rate_doubles',
  'dupr_rate_singles',
  'dupr_rate_date',
] as const

export interface DuprUpdateResult {
  duprId: string
  name: string
  status: 'updated' | 'skipped' | 'error'
  message?: string
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function MembersExtraPage() {
  const router = useRouter()
  const {
    user,
    userRoles,
    isLoading: isAuthLoading,
  } = useAuthCheck()

  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<DuprUpdateResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthLoading) return
    if (!user || !canManageMembers(userRoles ?? [])) {
      router.replace('/members/profile')
      return
    }
  }, [user, userRoles, isAuthLoading, router])

  const processFile = useCallback(async (rows: DuprBulkRow[]) => {
    const list: DuprUpdateResult[] = []
    const today = getTodayDateString()

    for (const row of rows) {
      if (!row.duprId) {
        list.push({
          duprId: '',
          name: row.name,
          status: 'skipped',
          message: 'DUPR ID が空のためスキップ',
        })
        continue
      }

      const fetchRes = await fetchMemberByDuprId(row.duprId)
      if (!fetchRes.success || fetchRes.error) {
        list.push({
          duprId: row.duprId,
          name: row.name,
          status: 'error',
          message: fetchRes.error?.message ?? '取得に失敗しました',
        })
        continue
      }

      const member = fetchRes.data
      if (!member) {
        list.push({
          duprId: row.duprId,
          name: row.name,
          status: 'skipped',
          message: '該当する会員が存在しません',
        })
        continue
      }

      const updateData: Record<string, unknown> = {}
      if (DUPR_UPDATE_COLUMNS.includes('dupr_rate_doubles')) {
        updateData.dupr_rate_doubles = row.doublesRating
      }
      if (DUPR_UPDATE_COLUMNS.includes('dupr_rate_singles')) {
        updateData.dupr_rate_singles = row.singlesRating
      }
      if (DUPR_UPDATE_COLUMNS.includes('dupr_rate_date')) {
        updateData.dupr_rate_date = today
      }

      const updateRes = await updateMember(member.id, updateData as any)
      if (!updateRes.success) {
        list.push({
          duprId: row.duprId,
          name: row.name,
          status: 'error',
          message: updateRes.error?.message ?? '更新に失敗しました',
        })
        continue
      }

      list.push({
        duprId: row.duprId,
        name: row.name,
        status: 'updated',
        message: `Doubles ${row.doublesRating} / Singles ${row.singlesRating} で更新`,
      })
    }

    return list
  }, [])

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setResults([])
    setIsProcessing(true)

    try {
      const text = await file.text()
      const rows = parseDuprBulkFile(text)
      if (rows.length === 0) {
        setErrorMessage('有効なレコードが1件もありません。書式を確認してください。')
        setIsProcessing(false)
        return
      }
      const list = await processFile(rows)
      setResults(list)
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました'
      )
    } finally {
      setIsProcessing(false)
      e.target.value = ''
    }
  }

  if (isAuthLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>読み込み中...</div>
      </div>
    )
  }

  if (!user || !canManageMembers(userRoles ?? [])) {
    return null
  }

  const updatedCount = results.filter((r) => r.status === 'updated').length
  const skippedCount = results.filter((r) => r.status === 'skipped').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>DUPR一括登録</h1>
          <Link href="/members/admin/extra" style={styles.backLink}>
            エキストラ管理へ戻る
          </Link>
        </header>

        <section style={styles.section} aria-labelledby="section-upload">
          <h2 id="section-upload" style={styles.sectionTitle}>
            ファイルをアップロード
          </h2>
          <div style={styles.card}>
            <p style={styles.help}>
              書式: 氏名 / DUPR ID / 住所 / 年齢・性別 / Doubles Rating /
              Singles Rating（6行1件、レコード間は空行）
            </p>
            <label style={styles.fileLabel}>
              <input
                type="file"
                accept=".txt,.csv,text/plain"
                onChange={handleFileChange}
                disabled={isProcessing}
                aria-label="DUPRファイルを選択"
              />
              {isProcessing ? '処理中...' : 'ファイルを選択'}
            </label>
          </div>
        </section>

        {errorMessage && (
          <div style={styles.errorBox} role="alert">
            {errorMessage}
          </div>
        )}

        {results.length > 0 && (
          <section style={styles.section} aria-labelledby="section-result">
            <h2 id="section-result" style={styles.sectionTitle}>
              更新結果
            </h2>
            <div style={styles.card}>
              <p style={styles.summary}>
                更新: {updatedCount} 件 / スキップ: {skippedCount} 件 /
                エラー: {errorCount} 件
              </p>
              <ul style={styles.resultList}>
                {results.map((r, i) => (
                  <li
                    key={`${r.duprId}-${i}`}
                    style={{
                      ...styles.resultItem,
                      color:
                        r.status === 'updated'
                          ? '#8f8'
                          : r.status === 'error'
                            ? '#f88'
                            : '#888',
                    }}
                  >
                    <span style={styles.resultName}>
                      {r.name}（{r.duprId || '—'}）
                    </span>
                    <span style={styles.resultStatus}>
                      {r.status === 'updated'
                        ? '更新済'
                        : r.status === 'skipped'
                          ? 'スキップ'
                          : 'エラー'}
                      {r.message && ` — ${r.message}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
  },
  content: {
    width: '100%',
    maxWidth: '640px',
  },
  loading: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  backLink: {
    color: '#888',
    textDecoration: 'none',
    fontSize: '0.85rem',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#888',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #333',
  },
  help: {
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '12px',
    marginTop: 0,
  },
  fileLabel: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  errorBox: {
    padding: '12px 20px',
    backgroundColor: '#300',
    border: '1px solid #f66',
    borderRadius: '8px',
    color: '#faa',
    marginBottom: '24px',
  },
  summary: {
    fontWeight: 'bold',
    marginBottom: '12px',
    marginTop: 0,
  },
  resultList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  resultItem: {
    padding: '6px 0',
    borderBottom: '1px solid #333',
    fontSize: '0.9rem',
  },
  resultName: {
    display: 'inline-block',
    minWidth: '180px',
  },
  resultStatus: {
    color: 'inherit',
  },
}
