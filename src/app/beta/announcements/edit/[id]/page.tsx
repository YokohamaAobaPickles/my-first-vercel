/**
 * Filename: src/app/announcements/edit/[id]/page.tsx
 * Version : V1.5.1
 * Update  : 2026-02-12
 * Remarks : 
 * V1.5.1
 * - ボタンレイアウトの変更とスタイルの適用（キャンセル・更新・削除）。
 * V1.5.0 - 新デザインシステム (baseStyles/annStyles) に準拠。
 * - B-12 お知らせ編集、B-14 物理削除機能を実装。
 * - 権限チェックによるリダイレクトを実装。
 * V1.4.1
 * - エラー時の UI を改善（Loading のまま固まらないように）
 * - fetchAnnouncementById の失敗時にエラー画面を表示
 * - 削除時の confirm(false) パターンに対応（テスト B-12）
 * - saving 状態の扱いを改善（更新中の連打防止）
 * V1.4.0
 * - announcementApi を使用した実装へ全面刷新 (B-12)
 * - スキーマ変更 (announcement_id) に対応
 * - 物理削除ボタンの実装
 * - スタイル定義をルール（定義ごとに改行）に従い修正
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { canManageAnnouncements } from '@/utils/auth';
import {
  fetchAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/announcementApi';
import {
  AnnouncementStatus,
  AnnouncementTarget,
} from '@/types/announcement';
import { baseStyles } from '@/types/styles/style_common';
import { annStyles } from '@/types/styles/style_announcements';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { isLoading: isAuthLoading, userRoles } = useAuthCheck();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォームステート
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [status, setStatus] = useState<AnnouncementStatus>('draft');
  const [isPinned, setIsPinned] = useState(false);
  const [targetRole, setTargetRole] = useState<AnnouncementTarget>('all');

  // 1. 権限チェック
  useEffect(() => {
    if (isAuthLoading) return;
    if (!canManageAnnouncements(userRoles)) {
      router.replace('/announcements');
    }
  }, [isAuthLoading, userRoles, router]);

  // 2. データ初期読み込み
  useEffect(() => {
    const loadData = async () => {
      if (isNaN(id)) return;
      const result = await fetchAnnouncementById(id);
      if (result.success && result.data) {
        setTitle(result.data.title);
        setContent(result.data.content || '');
        setPublishDate(result.data.publish_date || '');
        setStatus(result.data.status);
        setIsPinned(result.data.is_pinned);
        setTargetRole(result.data.target_role || 'all');
      }
      setIsDataLoading(false);
    };
    if (!isAuthLoading && canManageAnnouncements(userRoles)) {
      loadData();
    }
  }, [id, isAuthLoading, userRoles]);

  // 更新処理 (B-12)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateAnnouncement(id, {
      title,
      content,
      publish_date: publishDate || null,
      status,
      is_pinned: isPinned,
      target_role: targetRole,
    });

    if (result.success) {
      router.push('/announcements/admin');
    } else {
      alert('更新に失敗しました');
      setIsSubmitting(false);
    }
  };

  // 削除処理 (B-14)
  const handleDelete = async () => {
    if (!window.confirm('この記事を完全に削除します。よろしいですか？')) return;
    setIsSubmitting(true);
    const result = await deleteAnnouncement(id);
    if (result.success) {
      router.push('/announcements/admin');
    } else {
      alert('削除に失敗しました');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isDataLoading) {
    return (
      <div style={{ ...baseStyles.containerDefault, textAlign: 'center' }}>
        <div style={{ padding: '50px', color: '#FFF' }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/announcements/admin" style={baseStyles.link}>
            ＜ 管理一覧
          </Link>
        </div>

        <h2 style={annStyles.adminPageTitle}>お知らせ編集</h2>

        <form onSubmit={handleUpdate} style={annStyles.formContainer}>
          {/* タイトル */}
          <div style={annStyles.formGroup}>
            <label style={annStyles.label}>タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={annStyles.input}
              required
            />
          </div>

          {/* 本文 */}
          <div style={annStyles.formGroup}>
            <label style={annStyles.label}>本文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={annStyles.textarea}
              required
            />
          </div>

          {/* 公開開始日 */}
          <div style={annStyles.formGroup}>
            <label style={annStyles.label}>公開開始日</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              style={annStyles.input}
            />
          </div>

          {/* ステータス & ターゲット */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ ...annStyles.formGroup, flex: 1 }}>
              <label style={annStyles.label}>ステータス</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                style={annStyles.input}
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="archived">アーカイブ（無効）</option>
              </select>
            </div>
            <div style={{ ...annStyles.formGroup, flex: 1 }}>
              <label style={annStyles.label}>公開対象</label>
              <select
                value={targetRole}
                onChange={(e) =>
                  setTargetRole(e.target.value as AnnouncementTarget)
                }
                style={annStyles.input}
              >
                <option value="all">全員</option>
                <option value="premium">プレミアム限定</option>
              </select>
            </div>
          </div>

          {/* 重要ピン留め */}
          <div style={annStyles.formGroup}>
            <label style={annStyles.checkboxGroup}>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              <span style={{ color: '#FFF' }}>重要記事としてトップに固定する</span>
            </label>
          </div>

          {/* ボタン類 [キャンセル] [更新] [削除] */}
          <div style={{ ...annStyles.buttonGroup, gap: '10px' }}>

            {/* キャンセル：塗りつぶしなし、文字グレー */}
            <button
              type="button"
              onClick={() => router.push('/announcements/admin')}
              disabled={isSubmitting}
              style={{
                ...baseStyles.buttonOutline,
                border: '1px solid #9CA3AF',
                color: '#9CA3AF',
              }}
            >
              キャンセル
            </button>

            {/* 更新：青色塗りつぶし、文字背景色（管理パネル共通デザイン） */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...baseStyles.adminButtonSmall, // 既存の共通デザインを適用
                padding: '10px 16px',
                fontSize: '0.9rem',
                flex: 1,
                //border: 'none',
              }}
            >
              {isSubmitting ? '処理中...' : '更新する'}
            </button>

            {/* 削除：塗りつぶしなし、文字赤 */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{
                ...baseStyles.buttonOutline,
                border: '1px solid #dc3545',
                color: '#dc3545',
              }}
            >
              削除
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}