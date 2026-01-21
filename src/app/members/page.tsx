import { fetchMembers } from '../../lib/supabase'
import { formatMemberName } from '../../lib/memberLogic'
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