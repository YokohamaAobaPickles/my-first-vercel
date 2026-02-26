/**
 * Filename: src/app/announcements/new/page.tsx
 * Version : V1.5.0
 * Update  : 2026-02-12
 * Remarks : 
 * V1.5.0 - 新デザインシステム準拠。B-11 お知らせ新規作成を実装。
 * - ボタン構成を左側に「キャンセル」、右側に「作成」へ変更。
 * - 下部ナビゲーションとの干渉を防ぐため paddingBottom を追加。
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { canManageAnnouncements } from '@/utils/auth';
import { createAnnouncement } from '@/lib/announcementApi';
import {
  AnnouncementInput,
  AnnouncementStatus,
  AnnouncementTarget,
} from '@/types/announcement';
import { baseStyles } from '@/types/styles/style_common';
import { annStyles } from '@/types/styles/style_announcements';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, userRoles, user } = useAuthCheck();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    publish_date: new Date().toISOString().split('T')[0],
    is_pinned: false,
    status: 'published' as AnnouncementStatus,
    target_role: 'all' as AnnouncementTarget,
  });

  // 権限チェック：管理者以外は一般一覧へ戻す
  useEffect(() => {
    if (!isAuthLoading && !canManageAnnouncements(userRoles)) {
      router.replace('/announcements');
    }
  }, [isAuthLoading, userRoles, router]);

  if (isAuthLoading) {
    return (
      <div style={{ ...baseStyles.containerDefault, textAlign: 'center' }}>
        <div style={{ padding: '50px', color: '#FFF' }}>読み込み中...</div>
      </div>
    );
  }
  if (!canManageAnnouncements(userRoles)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError(null);

    const input: AnnouncementInput = {
      title: form.title,
      content: form.content,
      publish_date: form.publish_date || null,
      status: form.status,
      is_pinned: form.is_pinned,
      target_role: form.target_role,
      author_id: user.id,
      end_date: null,
    };

    const result = await createAnnouncement(input);

    if (result.success) {
      router.push('/announcements/admin');
    } else {
      setError(result.error?.message || '保存に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={{ ...baseStyles.content, paddingBottom: '120px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/announcements/admin" style={baseStyles.link}>
            ＜ 管理一覧
          </Link>
        </div>

        <h2 style={annStyles.adminPageTitle}>お知らせ新規作成</h2>

        {error && (
          <p style={{ color: '#dc3545', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={annStyles.formContainer}>
          <div style={annStyles.formGroup}>
            <label htmlFor="title" style={annStyles.label}>タイトル</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={annStyles.input}
              required
            />
          </div>

          <div style={annStyles.formGroup}>
            <label htmlFor="content" style={annStyles.label}>本文</label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={annStyles.textarea}
              rows={8}
            />
          </div>

          <div style={annStyles.formGroup}>
            <label htmlFor="publish_date" style={annStyles.label}>公開開始日</label>
            <input
              id="publish_date"
              type="date"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
              style={annStyles.input}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ ...annStyles.formGroup, flex: 1 }}>
              <label htmlFor="status" style={annStyles.label}>ステータス</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as AnnouncementStatus })
                }
                style={annStyles.input}
              >
                <option value="published">公開</option>
                <option value="draft">下書き</option>
              </select>
            </div>
            <div style={{ ...annStyles.formGroup, flex: 1 }}>
              <label htmlFor="target_role" style={annStyles.label}>公開対象</label>
              <select
                id="target_role"
                value={form.target_role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    target_role: e.target.value as AnnouncementTarget,
                  })
                }
                style={annStyles.input}
              >
                <option value="all">全員</option>
                <option value="premium">プレミアム限定</option>
              </select>
            </div>
          </div>

          <div style={annStyles.formGroup}>
            <label style={annStyles.checkboxGroup}>
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              />
              <span style={{ color: '#FFF' }}>重要記事としてトップに固定する</span>
            </label>
          </div>

          {/* ボタンレイアウト: [キャンセル] [作成] */}
          <div style={{ ...annStyles.buttonGroup, gap: '10px', marginTop: '30px' }}>
            
            {/* キャンセル：左側、グレー枠線 */}
            <button
              type="button"
              onClick={() => router.push('/announcements/admin')}
              disabled={saving}
              style={{
                ...baseStyles.buttonOutline,
                border: '1px solid #9CA3AF',
                color: '#9CA3AF',
              }}
            >
              キャンセル
            </button>

            {/* 作成：右側、青塗りつぶし、文字は背景色 */}
            <button
              type="submit"
              disabled={saving}
              style={{
                ...baseStyles.adminButtonSmall,
                border: 'none',
                flex: 1,
              }}
            >
              {saving ? '処理中...' : '作成'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}