/**
 * Filename: src/app/events/admin/components/AdminEventCard.tsx
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - 管理者向けイベントカードコンポーネントの初期実装
 */

"use client";

import Link from "next/link";
import { Event } from "../../types";
import { colors } from "@/style/style_common";
import { adminEventCard } from "@/style/style_event_admin";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateCell(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const dow = WEEKDAYS[d.getDay()];
  return `${day} ${dow}`;
}

function formatDeadline(deadlineStr: string): string {
  const d = new Date(deadlineStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();
  const min = d.getMinutes();
  return `${m}/${day} ${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

type AdminEventCardProps = { event: Event };

export default function AdminEventCard({ event }: AdminEventCardProps) {
  const remaining = Math.max(0, event.capacity - event.participants.length);
  const participantsCount = event.participants.length;
  const waitlistCount = event.waitlist.length;
  const applicantsCount = event.applicants.length;
  const lotteryLabel = event.lotteryDone ? "抽選済み" : "抽選前";

  return (
    <div style={adminEventCard.container}>
      <div style={adminEventCard.header}>
        <div style={adminEventCard.left}>
          <div style={adminEventCard.date}>{formatDateCell(event.date)}</div>
          <div style={adminEventCard.title}>{event.title}</div>
          <div style={adminEventCard.badges}>
            <span
              style={{
                ...adminEventCard.badge,
                color: colors.text,
                ...(event.lotteryDone
                  ? { backgroundColor: "#6A5ACD" }
                  : { backgroundColor: "#D98A3A" }),
              }}
            >
              {lotteryLabel}
            </span>
          </div>
        </div>
        <Link
          href={`/events/admin/${event.id}/edit`}
          style={adminEventCard.editButton}
        >
          編集
        </Link>
      </div>
      <div style={adminEventCard.metaRow}>
        <span>受付期限：{formatDeadline(event.deadline)}</span>
        <span>定員：{event.capacity}名（残り{remaining}）</span>
        <span>駐車場：{event.parkingCapacity}台</span>
        <span>参加：{participantsCount}名＋キャンセル待ち{waitlistCount}名</span>
        {!event.lotteryDone && <span>申請者：{applicantsCount}名</span>}
      </div>
      <div style={adminEventCard.info}>
        <div>🕒 {event.start}–{event.end}</div>
        <div>📍 {event.location}</div>
      </div>
    </div>
  );
}
