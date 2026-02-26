/**
 * Filename: src/app/members/profile/page.tsx
 * Version : V2.10.0
 * Update  : 2026-02-08
 * Remarks :
 * V2.10.0 - 新スタイルを適用およびコードのリファクタリングを実施。
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import liff from '@line/liff'

import { useAuthCheck } from '@/hooks/useAuthCheck'
import { canManageMembers } from '@/utils/auth'
import { calculateEnrollmentDays } from '@/utils/memberHelpers'
import { updateMemberStatus, deleteMember } from '@/lib/memberApi'
import { MemberStatus, MEMBER_STATUS_LABELS, MEMBER_KIND_LABELS, ROLES_LABELS } from '@/types/member'

import { colors, container, card, spacing, font, text, button, row, pageHeader } from '@/style/style_common';
import { memberPage } from '@/style/style_member';

export default function ProfilePage() {
  const { user, isLoading, userRoles } = useAuthCheck()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'withdraw' | 'cancel_join' | 'cancel_request' | null;
  }>({
    isOpen: false,
    type: null
  })

  if (isLoading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  if (!user) {
    return <div style={styles.container}>ユーザー情報が見つかりません。</div>
  }

  //const handleLogout = async () => {

  // 引数 e を受け取るように定義を変更
  const handleLogout = async (e: React.MouseEvent) => {
    // 【重要】ブラウザのデフォルト動作を完全に止める
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (typeof window === 'undefined') return

    const ua = navigator.userAgent.toLowerCase()
    const isLine = ua.includes('line')

    // デバッグ情報1: 判定結果の確認
    //alert(`Debug: isLine=${isLine}, UA=${ua.substring(0, 30)}...`)

    if (isLine) {
      // LINE環境: 
      // ログアウト後の自動ログインループを防ぐため、フラグを立てて閉じる。
      // 現在、LINEアプリではボタン自体を非表示にする運用へ移行中。
      localStorage.setItem('logout', 'true')
      try {
        if (liff.isLoggedIn()) liff.logout()
        liff.closeWindow()
      } catch (err) {
        console.error('LIFF close error:', err)
        router.replace('/login')
      }
    } else {
      // ブラウザ環境: 通常のログアウト処理
      sessionStorage.setItem('logout', 'true')
      sessionStorage.removeItem('auth_member_id')
      router.replace('/login')
    }
  }

  const handleAction = async () => {
    if (!modalConfig.type) return
    setIsSubmitting(true)

    try {
      let res
      if (modalConfig.type === 'cancel_join') {
        res = await deleteMember(user.id)
      } else {
        const nextStatus: MemberStatus =
          modalConfig.type === 'suspend' ? 'suspend_req' :
            modalConfig.type === 'withdraw' ? 'withdraw_req' : 'active'
        res = await updateMemberStatus(user.id, nextStatus)
      }

      if (res.success) {
        if (modalConfig.type === 'cancel_join') {
          router.push('/')
        } else {
          window.location.reload()
        }
      } else {
        alert(res.error?.message || 'エラーが発生しました')
      }
    } finally {
      setIsSubmitting(false)
      setModalConfig({ isOpen: false, type: null })
    }
  }

  // ステータス表示のためのラベルと色を決定
  const statusLabel = MEMBER_STATUS_LABELS[user.status as MemberStatus] || user.status;
  const statusColor = user.status === 'active' ? colors.status.active : colors.status.pending;
  // 非公開ラベル
  const PrivateLabel = !user.is_profile_public && (
    <span style={memberPage.privateBadge}>
      <span>（非公開）</span>
      <span>🔒</span>
    </span>
  );

  // 在籍日数の計算
  const enrollmentDays = calculateEnrollmentDays(user.create_date)

  //---------------------------------------------------------
  // 1. 旧コードを変数に代入して隔離（JSXなので変数に入れられます）
  const OldLayout = (
    <div style={styles.container}>
      {/* ここに既存のコメント入りのコードを全部移動 */}
      <div style={styles.container}>
        <div style={styles.content}>
          {/* ヘッダーエリア */}
          <div style={styles.header}>
            <h1 style={styles.title}>マイプロフィール</h1>
            {canManageMembers(userRoles) && (
              <Link href="/members/admin" style={styles.adminButton}>
                会員管理パネル
              </Link>
            )}
          </div>

          {/* 1. 基本情報ブロック */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>基本情報</h2>
              <div style={styles.actionButtons}>
                {user.status === 'new_req' && (
                  <button
                    onClick={() => setModalConfig({
                      isOpen: true,
                      type: 'cancel_join'
                    })}
                    style={styles.cancelButton}
                  >
                    入会取消
                  </button>
                )}
                {user.status === 'active' && (
                  <>
                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        type: 'suspend'
                      })}
                      style={styles.suspendButton}
                    >
                      休会申請
                    </button>
                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        type: 'withdraw'
                      })}
                      style={styles.withdrawButton}
                    >
                      退会申請
                    </button>
                  </>
                )}
                {(user.status === 'suspend_req' ||
                  user.status === 'withdraw_req') && (
                    <button
                      onClick={() => setModalConfig({
                        isOpen: true,
                        type: 'cancel_request'
                      })}
                      style={styles.cancelButton}
                    >
                      申請取消
                    </button>
                  )}
              </div>
            </div>
            <div style={styles.card}>
              {[
                { label: '会員番号', value: user.member_number || '-' },
                { label: 'ニックネーム', value: user.nickname },
                { label: 'メールアドレス', value: user.email || '-' },
                { label: '氏名', value: user.name },
                { label: '氏名（ローマ字）', value: user.name_roma || '-' },
                { label: '性別', value: user.gender || '-' },
                { label: '生年月日', value: user.birthday || '-' },
                {
                  label: '会員種別', value: MEMBER_KIND_LABELS[user.member_kind] ||
                    user.member_kind ||
                    '一般'
                },
                {
                  label: '役職',
                  value: userRoles?.map(r => ROLES_LABELS[r] || r).join(', ') || '-'
                },
                {
                  label: 'ステータス',
                  value: MEMBER_STATUS_LABELS[user.status as MemberStatus] ||
                    user.status,
                  color: user.status === 'active' ? '#52c41a' : '#faad14'
                },
                { label: '在籍日数', value: `${enrollmentDays} 日` },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={idx === 10 ? styles.infoRowLast : styles.infoRow}
                >
                  <span style={styles.label}>{item.label}</span>
                  <span style={{
                    ...styles.value,
                    color: item.color || '#fff'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 2. プロフィールブロック */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>プロフィール</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/members/search" style={styles.editButtonSmall}> 検索 </Link>
                <Link href="/members/profile/edit" style={styles.editButtonSmall}> 編集 </Link>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.infoRow}>
                <span style={styles.label}>郵便番号</span>
                <span style={styles.value}>{user.postal || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>住所</span>
                <span style={styles.value}>{user.address || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>電話番号</span>
                <span style={styles.value}>{user.tel || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>プロフィールメモ</span>
                <span style={styles.value}>{user.profile_memo || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>緊急連絡先電話</span>
                <span style={styles.value}>{user.emg_tel || '-'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>続柄</span>
                <span style={styles.value}>{user.emg_rel || '-'}</span>
              </div>
              <div style={styles.infoRowLast}>
                <span style={styles.label}>緊急連絡メモ</span>
                <span style={styles.value}>{user.emg_memo || '-'}</span>
              </div>
            </div>
          </section>

          {/* 3. 競技情報 (DUPR) ブロック */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>競技情報 (DUPR)</h2>
            </div>
            <div style={styles.card}>
              <div style={styles.infoRow}>
                <span style={styles.label}>DUPR ID</span>
                <span style={styles.value}>{user.dupr_id || '未登録'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Doubles Rating</span>
                <span style={styles.value}>
                  {user.dupr_rate_doubles?.toFixed(3) || '-'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Singles Rating</span>
                <span style={styles.value}>
                  {user.dupr_rate_singles?.toFixed(3) || '-'}
                </span>
              </div>
              <div style={styles.infoRowLast}>
                <span style={styles.label}>レート登録日</span>
                <span style={styles.value}>{user.dupr_updated_at || '-'}</span>
              </div>
            </div>
          </section>

          {/* フッターエリア */}
          <div style={styles.footer}>
            {/* LINEアプリでは自動ログインの仕組み上、ログアウトボタンを表示せず、
              ユーザーにアプリを閉じてもらう運用とする。
          */}
            {!(typeof window !== 'undefined' &&
              navigator.userAgent.toLowerCase().includes('line')) ? (
              <>
                <button
                  onClick={(e) => handleLogout(e)}
                  style={styles.logoutButton}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <p style={{ color: '#666', fontSize: '0.8rem' }}>
                  ※ LINEアプリでお使いの方は、右上の「×」で閉じてください。
                </p>
              </>
            )}
          </div>
          <footer style={footerStyle}>
            YAPMS V1.1.0 Copyright 2026
            {' '}
            Yokohama Aoba Pickles
          </footer>

        </div>

        {/* 確認用モーダル */}
        {modalConfig.isOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>
                {modalConfig.type === 'suspend' ? '休会申請' :
                  modalConfig.type === 'withdraw' ? '退会申請' :
                    modalConfig.type === 'cancel_join' ? '入会取消' : '申請取消'}
              </h3>
              <p style={styles.modalText}>
                {modalConfig.type === 'cancel_join'
                  ? '登録情報を完全に削除します。よろしいですか？'
                  : 'この操作を実行します。よろしいですか？'}
              </p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setModalConfig({ isOpen: false, type: null })}
                  style={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAction}
                  style={styles.confirmBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '処理中...' : '実行する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  // ここまでが旧デザインコード
  //---------------------------------------------------------

  return (
    <div style={container}>
      <div style={{ padding: spacing.md, paddingBottom: 100 }}>

        {/* タイトル */}
        <div style={pageHeader.container}>
          <h1 style={pageHeader.title}>プロフィール</h1>
        </div>

        {/* 1. 会員情報セクション */}
        <div style={row.header}>
          {/* 左側：見出しと検索ボタン */}
          <div style={row.leftGroup}>
            <span style={memberPage.sectionTitle}>会員情報</span>
            <Link href="/members/search" style={button.search}>🔎 検索</Link>
          </div>
          {/* 右側：管理ボタン（権限がある場合のみ） */}
          {canManageMembers(userRoles) && (
            <Link href="/members/admin" style={button.admin}>🧑‍🔬管理</Link>
          )}
        </div>
        {/* 会員情報カード */}
        <div style={card}>
          {/* 1段目: サマリー */}
          <div style={memberPage.rowBorder}>
            <div style={memberPage.grid3}>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>会員番号</span>
                <span style={memberPage.value}>{user.member_number || '-'}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>会員種別</span>
                <span style={memberPage.value}>{MEMBER_KIND_LABELS[user.member_kind] || '一般'}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>ステータス</span>
                <span style={{ ...memberPage.value, color: colors.status.active }}>
                  {MEMBER_STATUS_LABELS[user.status as MemberStatus] || user.status}
                </span>
              </div>
            </div>
          </div>
          {/* 2段目: アイコン・ニックネーム・役割 */}
          <div style={memberPage.rowBorder}>
            <div style={{ ...memberPage.grid3, alignItems: 'center' }}>
              <img src={user.profile_icon_url || '/icons/emoticon_smile.png'} alt="User Icon"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${colors.border}`
                }} />
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>ニックネーム</span>
                <span style={memberPage.value}>{user.nickname}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>役割</span>
                <span style={memberPage.value}>{userRoles?.[0] ? (ROLES_LABELS[userRoles[0] as keyof typeof ROLES_LABELS] || userRoles[0]) : '一般'}</span>
              </div>
            </div>
          </div>
          {/* 3段目: プロフィール文 */}
          <div style={memberPage.rowBorder}>
            <span style={memberPage.label}>プロフィール</span>
            <div style={memberPage.bodyText}>{user.profile_memo || '未設定'}</div>
          </div>
          {/* 4段目: DUPR情報 (3カラム: grid3) */}
          <div style={memberPage.rowLast}>
            <div style={memberPage.grid3}>
              {/* ダブルス */}
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>DUPR - D</span>
                <span style={memberPage.value}>
                  {/* 値があれば3桁表示、なければ NR */}
                  {user.dupr_rate_doubles != null ? user.dupr_rate_doubles.toFixed(3) : 'NR'}
                </span>
              </div>
              {/* シングルス */}
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>DUPR - S</span>
                <span style={memberPage.value}>
                  {user.dupr_rate_singles != null ? user.dupr_rate_singles.toFixed(3) : 'NR'}
                </span>
              </div>
              {/* 記録日 */}
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>DUPR - Date</span>
                <span style={memberPage.value}>
                  {user.dupr_updated_at || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 基本情報セクション */}
        <div style={{ ...row.header, marginTop: spacing.lg, marginBottom: spacing.sm }}>
          <div style={row.leftGroup}>
            <span style={memberPage.sectionTitle}>基本情報</span>
            {/* is_profile_public が false (非公開) のときだけ表示 */}
            {PrivateLabel} {/* 🔒（非公開）ラベル */}
          </div>
          <Link href="/members/profile/edit" style={button.edit}>📝 編集</Link>
        </div>

        {/* 基本情報カード */}
        <div style={card}>
          <div style={memberPage.rowBorder}>
            <div style={memberPage.infoBlock}>
              <span style={memberPage.label}>メールアドレス</span>
              <span style={memberPage.value}>{user.email || '-'}</span>
            </div>
          </div>
          {/* 氏名 (1カラム) */}
          <div style={memberPage.rowBorder}>
            <div style={memberPage.infoBlock}>
              <span style={memberPage.label}>氏名</span>
              <span style={memberPage.value}>
                {user.name} ({user.name_roma || '-'})
              </span>
            </div>
          </div>
          {/* 性別・生年月日 (2カラム: grid2) */}
          <div style={memberPage.rowBorder}>
            <div style={{ ...memberPage.grid2, padding: `${spacing.md} 0` }}>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>性別</span>
                <span style={memberPage.value}>{user.gender || '-'}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>生年月日</span>
                <span style={memberPage.value}>{user.birthday || '-'}</span>
              </div>
            </div>
          </div>
          {/* 郵便・電話 (2カラム: grid2) */}
          <div style={memberPage.rowBorder}>
            <div style={{ ...memberPage.grid2, padding: `${spacing.md} 0` }}>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>郵便番号</span>
                <span style={memberPage.value}>{user.postal || '-'}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>電話番号</span>
                <span style={memberPage.value}>{user.tel || '-'}</span>
              </div>
            </div>
          </div>
          {/* 緊急連絡先電話・続柄 (2カラム: grid2) */}
          <div style={memberPage.rowBorder}>
            <div style={{ ...memberPage.grid2, padding: `${spacing.md} 0` }}>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>緊急連絡先電話</span>
                <span style={memberPage.value}>{user.emg_tel || '-'}</span>
              </div>
              <div style={memberPage.itemStack}>
                <span style={memberPage.label}>緊急連絡先（続柄）</span>
                <span style={memberPage.value}>{user.emg_rel || '-'}</span>
              </div>
            </div>
          </div>
          {/* 緊急連絡メモ (1カラム) */}
          <div style={memberPage.rowLast}>
            <div style={memberPage.infoBlock}>
              <span style={memberPage.label}>緊急連絡メモ</span>
              <div style={memberPage.bodyText}>
                {user.emg_memo || 'メモはありません。'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* フッターエリア */}
      <div style={text.footer}>
        {/* LINEアプリでは自動ログインの仕組み上、ログアウトボタンを表示せず、
              ユーザーにアプリを閉じてもらう運用とする。
          */}
        {!(typeof window !== 'undefined' &&
          navigator.userAgent.toLowerCase().includes('line')) ? (
          <button
            onClick={(e) => handleLogout(e)}
            style={{
              ...button.base,
              backgroundColor: 'transparent', // デザイン案に合わせて控えめに
              border: `1px solid ${colors.border}`,
              color: colors.textSub,
              padding: '8px 24px',
              fontSize: font.size.sm
            }}
          >
            ログアウト
          </button>
        ) : (
          <>
            <p style={{ color: '#666', fontSize: '0.8rem' }}>
              ※ LINEアプリでお使いの方は、右上の「×」で閉じてください。
            </p>
          </>
        )}
      </div>

    </div >
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '1.5rem',
    margin: 0,
  },
  adminButton: {
    backgroundColor: '#111',
    color: '#00d1ff',
    padding: '6px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.75rem',
    border: '1px solid #333',
  },
  editButtonSmall: {
    backgroundColor: '#111',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.75rem',
    border: '1px solid #333',
  },
  section: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    color: '#888',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#111',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #333',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  infoRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 0 0',
  },
  label: {
    color: '#888',
    fontSize: '0.9rem',
  },
  value: {
    fontWeight: 500,
    color: '#fff',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  suspendButton: {
    backgroundColor: '#111',
    color: '#ffa940',
    border: '1px solid #333',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  withdrawButton: {
    backgroundColor: '#111',
    color: '#ff4d4f',
    border: '1px solid #333',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    padding: '20px 0',
  },
  logoutLink: {
    color: '#888',
    textDecoration: 'underline',
    fontSize: '0.9rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: '30px',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
    border: '1px solid #333',
  },
  modalTitle: {
    marginTop: 0,
    fontSize: '1.2rem',
  },
  modalText: {
    color: '#888',
    marginBottom: '24px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoutButton: {
    backgroundColor: '#111',
    color: '#888',
    textDecoration: 'none',
    border: '1px solid #333',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '8px 16px',
  },

  // デバッグ用リンクのスタイルを追加
  debugLink: {
    color: '#3b82f6',
    fontSize: '0.8rem',
    textDecoration: 'underline',
    opacity: 0.7,
  },
}

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '40px',
  fontSize: '0.7rem',
  color: '#666',
  letterSpacing: '0.05em',
}
