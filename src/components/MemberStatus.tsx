export function getStatusMessage(count: number) {
  if (count >= 100) return "目標達成！";
  if (count === 0) return "まだ会員がいません";
  return "募集中...";
}

export default function MemberStatus({ count }: { count: number }) {
  return (
    <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
      <p>ステータス: <strong>{getStatusMessage(count)}</strong></p>
    </div>
  );
}