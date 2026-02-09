/**
 * Filename: src/app/announcements/new/page.tsx
 * Version : V1.4.0
 * Update  : 2026-02-09
 * Remarks : 
 * V1.4.0
 * - announcementApi.createAnnouncement を使用した実装へ刷新 (B-11)
 * - 権限チェックによる不正アクセス防止を強化
 * - 投稿成功後の遷移先を管理一覧 (/announcements/admin) へ変更
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { canManageAnnouncements } from '@/utils/auth';
import { createAnnouncement } from '@/lib/announcementApi';
import { AnnouncementInput, AnnouncementStatus } from '@/types/announcement';

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
    target_role: 'all' as const,
  });

  // 権限チェック：管理者以外は一般一覧へ戻す
  useEffect(() => {
    if (!isAuthLoading && !canManageAnnouncements(userRoles)) {
      router.push('/announcements');
    }
  }, [isAuthLoading, userRoles, router]);

  if (isAuthLoading) return <div style={containerStyle}>読み込み中...</div>;
  if (!canManageAnnouncements(userRoles)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError(null);

    const input: AnnouncementInput = {
      title: form.title,
      content: form.content,
      publish_date: form.publish_date,
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
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/announcements/admin" style={backLinkStyle}>
          ← 管理一覧へ戻る
        </Link>
      </div>

      <h1 style={formTitleStyle}>お知らせ新規作成</h1>

      {error && (
        <p style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label htmlFor="title" style={labelStyle}>タイトル</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldGroupStyle}>
          <label htmlFor="content" style={labelStyle}>本文</label>
          <textarea
            id="content"
            rows={8}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={rowStyle}>
          <div style={{ flex: 1 }}>
            <label htmlFor="publish_date" style={labelStyle}>公開開始日</label>
            <input
              id="publish_date"
              type="date"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="status" style={labelStyle}>ステータス</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as AnnouncementStatus, // ★修正
                })
              }
              style={inputStyle}
            >
              <option value="published">公開</option>
              <option value="draft">下書き</option>
            </select>
          </div>

        </div>

        <div style={checkboxWrapperStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
            />
            重要記事としてピン留めする
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={saving ? { ...submitBtnStyle, opacity: 0.6 } : submitBtnStyle}
        >
          {saving ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </div>
  );
}

// --- スタイル定義 (1行1定義、ワードラップ80カラム) ---

const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  color: '#fff',
  minHeight: '100vh',
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto',
};

const backLinkStyle: React.CSSProperties = {
  color: '#aaa',
  textDecoration: 'none',
  fontSize: '0.9rem',
};

const formTitleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  marginBottom: '25px',
  textAlign: 'center',
};

const formStyle: React.CSSProperties = {
  backgroundColor: '#111',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #222',
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#aaa',
  marginBottom: '8px',
  fontWeight: 'bold',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#222',
  border: '1px solid #444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '1rem',
  boxSizing: 'border-box',
};

const checkboxWrapperStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '25px',
  border: '1px solid #333',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
};