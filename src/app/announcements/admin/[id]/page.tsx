/**
 * Filename: src/app/announcements/admin/[id]/page.tsx
 * Version : V1.6.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.6.0
 * - fetchAnnouncementById のエラーも UI に表示するよう改善（コパ提案）
 * - fetchReadDetails の members 取得項目追加に対応（member_number / email）
 * - readers エラー時に readers をクリアするよう安全性向上
 * 
 * V1.5.0 B-15 既読詳細表示。新API/スキーマ対応。
 * - 会員番号、ニックネーム、メールアドレスの表示に対応
 * - 権限不足時のリダイレクト実装
 * - announcementApi を使用したデータ取得へ移行
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { canManageAnnouncements } from '@/utils/auth';
import {
  fetchAnnouncementById,
  fetchReadDetails,
} from '@/lib/announcementApi';
import {
  Announcement,
  AnnouncementReadDetail,
} from '@/types/announcement';

export default function AnnouncementReadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoading: isAuthLoading, userRoles } = useAuthCheck();

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [readers, setReaders] = useState<AnnouncementReadDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    // 管理者権限チェック
    if (!canManageAnnouncements(userRoles)) {
      router.push('/announcements');
      return;
    }

    const loadData = async () => {
      if (!id) return;
      setIsDataLoading(true);

      const annId = Number(id);

      // 記事情報と既読詳細を並列で取得
      const [annRes, readRes] = await Promise.all([
        fetchAnnouncementById(annId),
        fetchReadDetails(annId),
      ]);

      // --- 記事情報 ---
      if (annRes.success && annRes.data) {
        setAnnouncement(annRes.data);
      } else {
        // コパ提案：記事取得失敗時も UI にエラーを表示
        setError(annRes.error?.message || '記事情報の取得に失敗しました');
      }

      // --- 既読詳細 ---
      if (readRes.success && readRes.data) {
        setReaders(readRes.data);
      } else {
        // コパ提案：readers をクリアして安全性向上
        setReaders([]);
        setError(readRes.error?.message || '既読情報の取得に失敗しました');
      }

      setIsDataLoading(false);
    };

    loadData();
  }, [isAuthLoading, userRoles, id, router]);

  if (isAuthLoading || isDataLoading) {
    return <div style={containerStyle}>読み込み中...</div>;
  }

  // 権限がない場合は何も表示しない（リダイレクト待機）
  if (!canManageAnnouncements(userRoles)) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={navWrapperStyle}>
        <Link href="/announcements/admin" style={backLinkStyle}>
          ← 管理パネルに戻る
        </Link>
      </div>

      {announcement && (
        <h2 style={titleStyle}>
          既読確認: {announcement.title}
        </h2>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={thStyle}>会員情報</th>
              <th style={thRightStyle}>既読日時</th>
            </tr>
          </thead>
          <tbody>
            {readers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ ...tdStyle, color: '#666', textAlign: 'center' }}
                >
                  既読データはありません
                </td>
              </tr>
            ) : (
              readers.map((r, i) => (
                <tr key={i} style={rowStyle}>
                  <td style={tdStyle}>
                    <div style={memberCodeStyle}>
                      #{r.members?.member_number || '----'}
                    </div>
                    <div style={memberNameStyle}>
                      {r.members?.nickname} ({r.members?.name})
                    </div>
                    <div style={memberEmailStyle}>
                      {r.members?.email}
                    </div>
                  </td>
                  <td style={tdRightStyle}>
                    {new Date(r.read_at).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
  marginBottom: '20px',
};

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  margin: '20px 0',
  borderLeft: '4px solid #0070f3',
  paddingLeft: '12px',
};

const errorStyle: React.CSSProperties = {
  color: '#ff4d4f',
  marginBottom: '15px',
};

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: '#111',
  borderRadius: '10px',
  border: '1px solid #222',
  overflow: 'hidden',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const headerRowStyle: React.CSSProperties = {
  borderBottom: '2px solid #222',
  backgroundColor: '#1a1a1a',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '15px',
  fontSize: '0.85rem',
  color: '#888',
};

const thRightStyle: React.CSSProperties = {
  ...thStyle,
  textAlign: 'right',
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #222',
};

const tdStyle: React.CSSProperties = {
  padding: '15px',
  fontSize: '0.95rem',
};

const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
  fontSize: '0.85rem',
  color: '#aaa',
};

const memberCodeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#0070f3',
  fontWeight: 'bold',
};

const memberNameStyle: React.CSSProperties = {
  fontWeight: 'bold',
};

const memberEmailStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#666',
};
