/**
 * Filename: members/admin/page.tsx
 * Version : V1.0.2
 * Update  : 2026-01-21 
 * 内容：
 * V1.0.2
 * - liff.login のリダイレクト先を明示的に指定
 * V1.0.1
 * - liff.login に redirectUri を追加し、ローカル開発中に本番へ飛ばされる問題を修正
 * V1.0.0
 * - 会員一覧を表示
 * - membersテーブルからLINE IDをキーに会員情報を取得
 * - 氏名、会員種別、役割、ステータスの表示に対応
 */

import { fetchMembers } from '../../../lib/supabase'
import { formatMemberName } from '../../../lib/memberLogic'
import Link from 'next/link'

export default async function MemberListPage() {
  const members = await fetchMembers()

  return (
    <div style={{ padding: '40px' }}>
      <h1>会員一覧</h1>
      <ul>
        {members?.map((member) => (
          <li key={member.id}>{formatMemberName(member.name)}</li>
        ))}
      </ul>
      <hr />
      <Link href="/">トップへ戻る</Link>
    </div>
  )
}