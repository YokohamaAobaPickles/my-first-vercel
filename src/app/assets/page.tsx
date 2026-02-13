/**
 * Filename: src/app/assets/page.tsx
 * Version: V0.2.0
 * Update: 2026-02-13
 * Remarks: V0.2.0 - PNG画像のプレビュー表示機能を追加
 */
import Image from 'next/image';

export default function AssetsPage() {
  // プレースホルダ用のダミー画像データ
  const dummyAssets = [
    { id: 1, name: '救急(png64)', src: '/icons/first_aid_64.png' },
    { id: 2, name: '救急(png128)', src: '/icons/first_aid_128.png' },
    { id: 3, name: '救急(png256)', src: '/icons/first_aid_256.png' },
    { id: 4, name: '救急(svg)', src: '/icons/first_aid.svg' },
    { id: 5, name: '救急(svg_dark)', src: '/icons/first_aid_dark.svg' },
    { id: 6, name: '救急(svg_blue)', src: '/icons/first_aid_blue.svg' },
    { id: 7, name: '救急(svg_office)', src: '/icons/first_aid_office.svg' },
    { id: 8, name: '虫眼鏡', src: '/icons/magnifying_glass.png' },
    { id: 9, name: 'ユーザ', src: '/icons/user.png' },
    { id: 10, name: 'グループ', src: '/icons/users4.png' },
  ];

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    maxWidth: '800px'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  };

  const imageWrapperStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '8px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h1>資産・備品管理（準備中）</h1>
      <p>Vercelでの画像表示テスト用プレビューです。</p>

      <div style={gridStyle}>
        {dummyAssets.map((asset) => (
          <div key={asset.id} style={imageWrapperStyle}>
            <Image
              src={asset.src}
              alt={asset.name}
              width={50}
              height={50}
              style={{
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              {asset.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}