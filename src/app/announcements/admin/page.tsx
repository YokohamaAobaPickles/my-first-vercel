/**
 * Filename: src/app/announcements/admin/page.tsx
 * Version : V1.4.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.4.0 テスト(V1.1.0)に基づきリファクタリング。
 * - announcementApi.fetchAnnouncements を使用したデータ取得へ移行
 * - 権限不足時の自動リダイレクト(B-11~15ガード)を実装
 * - スキーマ変更(announcement_id)への完全対応
 * - ステータス表示に共通定義(ANNOUNCEMENT_STATUS_LABELS)を適用
 * V1.3.1
 * - 管理者一覧にも「重要」ラベルを表示するように修正
 * V1.3.0
 * - 一般向け「記事一覧に戻る」リンクを追加
 * - レイアウトをダークモード(800px)へ調整
 * V1.2.0
 * - useAuthCheck対応版
 * V1.1.0
 * - 各記事の既読者数（👀）を表示する機能を追加
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { canManageAnnouncements } from '@/utils/auth';
import { fetchAnnouncements } from '@/lib/announcementApi';
import {
  AnnouncementListItem,
  ANNOUNCEMENT_STATUS_LABELS,
} from '@/types/announcement';

export default function AnnouncementAdminPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, userRoles, user } = useAuthCheck();
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  // 権限チェックとデータ取得
  useEffect(() => {
    if (isAuthLoading) return;

    // お知らせ担当ロール（会長・副会長・System Admin）以外はリダイレクト
    if (!canManageAnnouncements(userRoles)) {
      router.push('/announcements');
      return;
    }

    const loadData = async () => {
      // 管理者として全記事を取得（user.idを渡すことで既読数も取得）
      const result = await fetchAnnouncements(user?.id);
      if (result.success && result.data) {
        setAnnouncements(result.data);
      } else {
        setError(result.error?.message || 'データの取得に失敗しました');
      }
    };

    loadData();
  }, [isAuthLoading, userRoles, user, router]);

  if (isAuthLoading) {
    return <div style={containerStyle}>読み込み中...</div>;
  }

  // 権限がない場合は何も表示せずリダイレクトを待つ（テスト要件）
  if (!canManageAnnouncements(userRoles)) {
    return null;
  }

  // 重要度と日付降順でソートする
  const sorted = [...announcements].sort((a, b) => {
    // 1. is_pinned を優先
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    // 2. publish_date の降順（null は "" として扱う）
    const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
    const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
    
    return dateB - dateA;
  });

  return (
    <div style={containerStyle}>
      <div style={navWrapperStyle}>
        <Link
          href="/announcements"
          style={backLinkStyle}
        >
          ← 一般向け記事一覧に戻る
        </Link>
        <Link
          href="/announcements/new"
          style={newBtnStyle}
        >
          + 新規作成
        </Link>
      </div>

      <h2 style={titleStyle}>お知らせ管理 (管理者用)</h2>

      {error && <div style={errorStyle}>{error}</div>}

      {sorted.map((ann) => (
        <div
          key={ann.announcement_id}
          style={adminCardStyle}
        >
          <div style={cardContentStyle}>
            <div style={statusRowStyle}>
              <div style={statusBadgeStyle(ann.status)}>
                {ANNOUNCEMENT_STATUS_LABELS[ann.status]}
              </div>
              {ann.is_pinned && <span style={pinBadgeStyle}>重要</span>}
            </div>
            <h3 style={cardTitleStyle}>{ann.title}</h3>
            <div style={cardMetaStyle}>{ann.publish_date}</div>
          </div>

          <div style={actionGroupStyle}>
            <Link
              href={`/announcements/admin/${ann.announcement_id}`}
              style={readCountLinkStyle}
            >
              👀 {ann.read_count || 0}
            </Link>
            <Link
              href={`/announcements/edit/${ann.announcement_id}`}
              style={editLinkStyle}
            >
              編集
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- スタイル定義 ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto',
};

const navWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem',
};

const newBtnStyle: React.CSSProperties = {
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 'bold',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  marginBottom: '20px',
};

const errorStyle: React.CSSProperties = {
  color: '#ff4d4f',
  marginBottom: '15px',
};

const adminCardStyle: React.CSSProperties = {
  border: '1px solid #222',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#111',
};

const cardContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const statusRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  fontSize: '0.7rem',
  color: status === 'published' ? '#4caf50' : '#888',
  marginBottom: '4px',
});

const pinBadgeStyle: React.CSSProperties = {
  backgroundColor: '#ff4d4f',
  color: 'white',
  padding: '1px 5px',
  borderRadius: '3px',
  fontSize: '0.65rem',
  marginBottom: '4px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  marginBottom: '4px',
  margin: 0,
};

const cardMetaStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#666',
};

const actionGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const readCountLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#aaa',
  fontSize: '0.9rem',
  backgroundColor: '#222',
  padding: '4px 8px',
  borderRadius: '6px',
};

const editLinkStyle: React.CSSProperties = {
  color: '#4dabf7',
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 'bold',
};