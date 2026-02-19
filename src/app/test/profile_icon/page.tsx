/**
 * Filename: page.tsx
 * Version : V1.0.3
 * Update  : 2026-02-19
 * Remarks : 
 * V1.0.3 - メンバー選択時に即座にプレビューURLを反映するよう修正。
 * V1.0.2 - メンバー選択時に既存のアイコンURLをプレビューに反映するよう改善。
 * V1.0.0 - プロフィールアイコン登録・サイズ別表示テスト画面。
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchMembersForTest,
  uploadProfileIcon,
  deleteProfileIcon
} from '@/app/test/api/supabaseApi';

export default function ProfileIconTestPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await fetchMembersForTest();
      setMembers(data);
    } catch (e) {
      alert('メンバー取得失敗');
    }
  };

  // メンバー選択時にプレビューURLも更新する
  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    if (!id) {
      setPreviewUrl(null);
      return;
    }
    const member = members.find((m) => m.id === id);
    setPreviewUrl(member?.profile_icon_url || null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files || 
      !selectedMemberId
    ) {
      return;
    }
    const file = e.target.files[0];

    try {
      const url = await uploadProfileIcon(selectedMemberId, file);
      setPreviewUrl(url);
      await loadMembers(); // 最新のURLをリストに反映
    } catch (err) {
      alert('アップロード失敗');
    }
  };

  const handleReset = async () => {
    if (!selectedMemberId) {
      return;
    }
    try {
      const member = members.find((m) => m.id === selectedMemberId);
      await deleteProfileIcon(selectedMemberId, member?.profile_icon_url);
      setPreviewUrl(null);
      await loadMembers();
    } catch (err) {
      alert('リセット失敗');
    }
  };

  // スタイル定義
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    color: 'white',
    background: 'linear-gradient(to bottom, #11353f 0%, #000000 100%)',
    minHeight: '100vh'
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    marginTop: '8px',
    backgroundColor: '#194e5d',
    color: 'white',
    border: '1px solid #1e5e70',
    borderRadius: '4px'
  };

  const circleBase: React.CSSProperties = {
    borderRadius: '50%',
    backgroundColor: '#11353f',
    border: '1px solid #1e5e70',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2>プロフィールアイコン テスト</h2>

      {/* メンバー選択 */}
      <div style={{ marginBottom: '20px' }}>
        <label>対象メンバー選択: </label>
        <select
          value={selectedMemberId}
          onChange={(e) => handleMemberChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">選択してください</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.nickname})
            </option>
          ))}
        </select>
      </div>

      {/* 操作ボタン */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={!selectedMemberId}
        />
        <button 
          onClick={handleReset} 
          style={{ backgroundColor: '#d9534f', color: 'white' }}
        >
          リセット
        </button>
      </div>

      {/* プレビュー表示（サイズ別） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[128, 64, 32].map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <p>{size}px</p>
            <div 
              style={{ 
                ...circleBase, 
                width: size, 
                height: size, 
                margin: '0 auto' 
              }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="icon"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}