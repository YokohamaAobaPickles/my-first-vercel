/**
 * Filename: src/app/announcements/admin/page.tsx
 * Version : V1.5.8
 * Update  : 2026-02-12
 * Remarks : 
 * V1.5.8
 * - 新規作成ボタンをタイトル右端へ確実に配置（Flexbox調整）。
 * V1.5.7
 * - 消えていた新規作成ボタンを復活。
 * V1.5.6
 * - レイアウト微調整。公開日をステータス横へ移動。
 * - タイトル下には作成日と更新日を表示するように変更。
 * V1.5.5
 * - レイアウト変更。既読数と編集ボタンをステータスバッジの横へ移動。
 * - タイトル表示領域を最大化。
 * V1.5.4
 * - デザイン調整。戻るリンクを最上部、新規作成をタイトル右へ。
 * V1.5.3
 * - publish_date の null 安全性を確保。
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
import { baseStyles } from '@/types/styles/style_common';
import { annStyles } from '@/types/styles/style_announcements';

export default function AnnouncementAdminPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, userRoles, user } = useAuthCheck();
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!canManageAnnouncements(userRoles)) {
      router.replace('/announcements');
    }
  }, [isAuthLoading, userRoles, router]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isAuthLoading || !user?.id || !canManageAnnouncements(userRoles)) return;
      setIsDataLoading(true);
      const result = await fetchAnnouncements(user.id);
      
      if (isMounted && result.data) {
        const sortedData = [...result.data].sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          const dateA = a.publish_date ?? '';
          const dateB = b.publish_date ?? '';
          return dateB.localeCompare(dateA);
        });
        setAnnouncements(sortedData);
        setIsDataLoading(false);
      } else if (isMounted) {
        setIsDataLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [isAuthLoading, user?.id, userRoles]);

  if (isAuthLoading || isDataLoading) {
    return <div style={baseStyles.containerDefault}>読み込み中...</div>;
  }

  const formatDate = (isoString?: string) => isoString?.split('T')[0] ?? '---';

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        
        {/* --- 最上部：戻るリンク --- */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/announcements" style={baseStyles.link}>
            ＜ 一般向け記事一覧
          </Link>
        </div>

        {/* --- タイトル ＆ 新規作成ボタン (配置修正) --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          width: '100%'
        }}>
          <h2 style={{ ...annStyles.adminPageTitle, marginBottom: 0 }}>
            お知らせ管理
          </h2>
          <Link href="/announcements/new" style={baseStyles.adminButtonSmall}>
            新規作成
          </Link>
        </div>

        {/* --- 記事リスト --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginTop: '10px' }}>
          {announcements.map((item) => (
            <div key={item.announcement_id} style={annStyles.adminCard}>
              <div style={annStyles.adminCardMain}>
                
                {/* --- 上段：バッジ ＆ 公開日 ＆ アクション --- */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '4px' 
                }}>
                  <div style={{ ...annStyles.badgeContainer, alignItems: 'center' }}>
                    {item.is_pinned && (
                      <span style={annStyles.importanceLabel}>重要</span>
                    )}
                    <span style={annStyles.statusBadge(item.status)}>
                      {ANNOUNCEMENT_STATUS_LABELS[item.status]}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#9CA3AF', marginLeft: '8px' }}>
                      公開日: {item.publish_date ?? '未設定'}
                    </span>
                  </div>

                  <div style={annStyles.actionBox}>
                    <Link
                      href={`/announcements/admin/${item.announcement_id}`}
                      style={annStyles.readBadge}
                    >
                      👀 {item.read_count}
                    </Link>
                    <Link
                      href={`/announcements/edit/${item.announcement_id}`}
                      style={baseStyles.secondaryButtonMinimal}
                    >
                      編集
                    </Link>
                  </div>
                </div>

                {/* --- 中段：タイトル --- */}
                <h3 style={{ ...annStyles.adminCardTitle, margin: '6px 0' }}>
                  {item.title}
                </h3>

                {/* --- 下段：作成・更新メタ情報 --- */}
                <div style={{ ...annStyles.adminMetaInfo, display: 'flex', gap: '16px' }}>
                  <span>作成日: {formatDate(item.created_at)}</span>
                  <span>更新日: {formatDate(item.updated_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}