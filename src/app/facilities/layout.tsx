/**
 * Filename: src/app/facilities/layout.tsx
 * Version: V1.0.0
 * Update: 2026-03-04
 * Remarks: 施設管理機能の共通レイアウト。認証ガードと共通背景を定義。
 */

'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';
import { colors, container } from '@/style/style_common';

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthCheck();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        background: colors.background,
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        color: colors.text,
      }}
    >
      <div style={container}>
        {children}
      </div>
    </div>
  );
}
