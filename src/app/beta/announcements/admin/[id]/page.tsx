/**
 * Filename: src/app/announcements/admin/[id]/page.tsx
 * Version : V1.7.3
 * Update  : 2026-02-12
 * Remarks : 
 * V1.7.3 - デザインを一覧形式に刷新。カードを排除し可読性を向上。
 * - ボタンを「戻る」に短縮し、adminButtonSmall スタイルを適用。
 * V1.7.2 - annStyles 適用。
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { baseStyles } from '@/types/styles/style_common';
import { annStyles } from '@/types/styles/style_announcements';

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
    if (!canManageAnnouncements(userRoles)) {
      router.push('/announcements');
      return;
    }

    const loadData = async () => {
      if (!id) return;
      setIsDataLoading(true);
      const annId = Number(id);
      const [annRes, readRes] = await Promise.all([
        fetchAnnouncementById(annId),
        fetchReadDetails(annId),
      ]);

      if (annRes.success && annRes.data) {
        setAnnouncement(annRes.data);
      } else {
        setError(annRes.error?.message || '記事情報の取得に失敗しました');
      }

      if (readRes.success && readRes.data) {
        setReaders(readRes.data);
      } else {
        setReaders([]);
      }
      setIsDataLoading(false);
    };
    loadData();
  }, [isAuthLoading, userRoles, id, router]);

  if (isAuthLoading || isDataLoading) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={{ color: '#FFF', textAlign: 'center', padding: '50px' }}>
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        
        {/* --- ヘッダー --- */}
        <div style={annStyles.detailHeader}>
          <button
            onClick={() => router.push('/announcements/admin')}
            style={annStyles.backButtonMinimal}
          >
            ＜ 戻る
          </button>
        </div>

        {/* --- 記事タイトルセクション（カード外に出してシンプルに） --- */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ ...annStyles.publishDate, marginTop: '8px', marginBottom: '0' }}>
            {announcement?.publish_date}
          </div>
          <h1 style={{ ...annStyles.detailTitle, margin: 0 }}>
            {announcement?.title}
          </h1>
        </div>

        <hr style={{ ...annStyles.separator, marginTop: 0, marginBottom: '8px' }} />

        {/* --- 既読リストの見出し --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 8px 8px 8px',
          color: '#9CA3AF',
          fontSize: '0.8rem'
        }}>
          <span>会員情報</span>
          <span>既読日時</span>
        </div>

        <hr style={{ ...annStyles.separator, marginTop: 0, marginBottom: 0 }} />

        {/* --- 既読リスト本体（一覧形式） --- */}
        <div style={{ width: '100%' }}>
          {error && <p style={{ color: '#ef4444', padding: '10px' }}>{error}</p>}
          
          {readers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
              既読データはありません
            </div>
          ) : (
            readers.map((r, i) => (
              <div key={i} style={{
                padding: '16px 8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                {/* 左側：会員詳細 */}
                <div>
                  <div style={{ color: '#08A5EF', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    #{r.members?.member_number || '----'}
                  </div>
                  <div style={{ color: '#FFF', fontWeight: 'bold', margin: '2px 0' }}>
                    {r.members?.nickname} ({r.members?.name})
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                    {r.members?.email}
                  </div>
                </div>

                {/* 右側：日付 */}
                <div style={{ color: '#9CA3AF', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {new Date(r.read_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- 下部ボタンエリア --- */}
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '40px'
        }}>
          <button
            onClick={() => router.push('/announcements/admin')}
            style={{
              ...baseStyles.adminButtonSmall,
              padding: '10px 40px', // 少し横幅を持たせる
            }}
          >
            戻る
          </button>
        </div>

      </div>
    </div>
  );
}