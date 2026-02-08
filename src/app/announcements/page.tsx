/**
 * Filename: src/app/announcements/page.tsx
 * Version : V1.5.3
 * Update  : 2026-02-08
 * Remarks : 
 * V1.5.3
 * - fontWeight を文字列 '700' / '400' に戻し、CSS 標準形式に合わせる
 * - スタイル定義の改行ルールを再徹底
 * V1.5.2
 * - fontWeight の指定を数値に変更し、テスト (V1.2.0) との整合性を確保
 * - スタイル定義の改行ルールを再適用
 * V1.5.1
 * - 新API (V1.4.0) の is_read / is_pinned を活用するようにリファクタリング
 * - スタイル指定をテストの期待値 (700/400) に合わせ、ダークモードを強化
 * V1.5.0
 * - 新API (announcementApi V1.4.0) を使用するようにリファクタリング
 * - スキーマ変更 (id -> announcement_id) に対応
 * - 会員管理画面と統一感のあるダークモード・スタイルへ更新
 * V1.4.0
 * - PCユーザー(LINE IDなし)対応: emailをキーに既読判定
 * - プロフィール画面への戻るリンクを追加
 * - レイアウトをダークモード、幅800px対応へ調整
 * V1.3.0
 * - useAuthCheckフックを導入し、認証・ロール取得ロジックを共通化
 * - 最新の auth.ts (V1.3.0) 権限判定に対応
 * V1.2.0
 * - 既読管理機能（announcement_reads）との連携を追加
 * - 未読記事はタイトルを太字(bold)、既読記事は通常(normal)で表示
 * V1.1.0
 * - canManageAnnouncements を使用して、管理者のみ「管理パネル」ボタンを表示
 * V1.0.0
 * - お知らせ一覧表示用。status='published' かつ publish_date が今日以前のものを抽出。
 * - is_pinned による固定表示と日付順ソートを実装。
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchAnnouncements } from '@/lib/announcementApi'
import { AnnouncementListItem } from '@/types/announcement'
import { canManageAnnouncements } from '@/utils/auth'
import { useAuthCheck } from '@/hooks/useAuthCheck'

export default function AnnouncementsPage() {
  const {
    isLoading: isAuthLoading,
    userRoles,
    user
  } = useAuthCheck()

  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    let isMounted = true; // レースコンディション対策

    const loadData = async () => {
      // 認証中、またはユーザーIDがない場合は何もしない
      if (isAuthLoading || !user?.id) return;

      setIsDataLoading(true);
      const result = await fetchAnnouncements(user.id);

      if (isMounted) {
        setAnnouncements(result.data ?? []);
        setIsDataLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false; // コンポーネントがアンマウントされたら状態更新をキャンセル
    };
  }, [isAuthLoading, user?.id]);

  if (isAuthLoading || isDataLoading) {
    return <div style={containerStyle}>読み込み中...</div>
  }

  return (
    <div style={containerStyle}>
      <div style={headerWrapperStyle}>
        <Link href="/members/profile" style={backLinkStyle}>
          ← トップに戻る
        </Link>
        {canManageAnnouncements(userRoles) && (
          <Link href="/announcements/admin" style={adminBtnStyle}>
            管理パネル
          </Link>
        )}
      </div>

      <h1 style={titleStyle}>お知らせ一覧</h1>

      {announcements.length === 0 ? (
        <p style={emptyMessageStyle}>現在お知らせはありません。</p>
      ) : (
        <ul style={listStyle}>
          {announcements.map((item) => (
            <li key={item.announcement_id} style={listItemStyle}>
              {item.is_pinned && <span style={pinStyle}>重要</span>}

              <div style={{ flex: 1 }}>
                <Link
                  href={`/announcements/${item.announcement_id}`}
                  style={{
                    ...linkStyle,
                    color: item.is_read ? '#9ca3af' : '#60a5fa',
                    fontWeight: item.is_read ? '400' : '700',
                  }}
                >
                  {item.title}
                </Link>
                <div style={dateTextStyle}>
                  {item.publish_date} {item.is_read && '(既読済み)'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// --- スタイル定義 ---

const containerStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#f9fafb',
  minHeight: '100vh',
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
  wordWrap: 'break-word',
}

const headerWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '24px',
  borderLeft: '4px solid #3b82f6',
  paddingLeft: '16px',
}

const backLinkStyle: React.CSSProperties = {
  color: '#9ca3af',
  textDecoration: 'none',
  fontSize: '0.875rem',
}

const adminBtnStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '8px 20px',
  borderRadius: '9999px',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
}

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
}

const listItemStyle: React.CSSProperties = {
  borderBottom: '1px solid #1f2937',
  padding: '16px 0',
  display: 'flex',
  alignItems: 'flex-start',
}

const pinStyle: React.CSSProperties = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  marginRight: '12px',
  marginTop: '4px',
}

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  fontSize: '1.1rem',
}

const dateTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#6b7280',
  marginTop: '4px',
}

const emptyMessageStyle: React.CSSProperties = {
  color: '#9ca3af',
  textAlign: 'center',
  marginTop: '40px',
}