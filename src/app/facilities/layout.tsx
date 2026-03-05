/**
 * Filename: src/app/facilities/layout.tsx
 * Version: V1.1.0
 * Update: 2026-03-05
 * Remarks: 
 * V1.1.0 - 施設管理全体の基盤。認証ガードを子階層に委譲し、背景定義に専念
 * V1.0.0 - 施設管理機能の共通レイアウト
 */

'use client';

import { colors } from '@/style/style_common';

export default function FacilitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 親での isLoading ガードを削除。
  // これにより、内側のレイアウト(AdminLayoutなど)が即座に起動します。

  return (
    <div
      style={{
        background: colors.background,
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        color: colors.text,
      }}
    >
      {/* style={container} も、内側の各ページや
          AdminLayout で定義されているため、ここでは外します。
      */}
      {children}
    </div>
  );
}