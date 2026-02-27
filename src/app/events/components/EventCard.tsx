"use client";

import Link from "next/link";
import { Event } from "../types";
import { listItemEvent } from "@/style/style_event";
import { badge } from "@/style/style_common";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getStatusLabel(e: Event): string {
  if (e.lotteryDone && e.participants.length >= e.capacity) return "満員";
  if (e.lotteryDone && e.waitlist.length > 0) return "終了";
  return "受付中";
}

function getStatusStyle(label: string): React.CSSProperties {
  if (label === "受付中") return { ...badge.base, ...badge.status.active };
  if (label === "満員") return { ...badge.base, ...badge.status.danger };
  return { ...badge.base, ...badge.status.inactive };
}

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

function getReceiptLabel(e: Event): string {
  const now = new Date();
  const deadline = new Date(e.deadline);
  if (now >= deadline && !e.lotteryDone) return "抽選前";
  if (e.lotteryDone) return "抽選済み";
  return `受付中（${formatDeadline(e.deadline)}まで）`;
}

type EventCardProps = { event: Event };

export default function EventCard({ event }: EventCardProps) {
  const statusLabel = getStatusLabel(event);
  const receiptLabel = getReceiptLabel(event);
  const remaining = Math.max(0, event.capacity - event.participants.length);
  const feeYen = event.fee ?? 500;
  const displayParticipants = event.participants.length > 0 ? event.participants : event.applicants;
  const total = displayParticipants.length;
  const showCount = Math.min(5, total);
  const rest = total - showCount;

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
      <div style={listItemEvent.container}>
        <div style={listItemEvent.header}>
          <div style={listItemEvent.date}>{formatDateCell(event.date)}</div>
          <div style={listItemEvent.title}>{event.title}</div>
          <div style={listItemEvent.badges}>
            <span style={getStatusStyle(statusLabel)}>{statusLabel}</span>
            <span style={{ fontSize: 11, color: "lightgray" }}>{receiptLabel}</span>
          </div>
        </div>
        <div style={listItemEvent.metaRow}>
          <span style={listItemEvent.metaItem}>
            定員：{event.capacity}名（残り{remaining}）
          </span>
          <span style={listItemEvent.metaItem}>｜</span>
          <span style={listItemEvent.metaItem}>費用：{feeYen}円</span>
          <span style={listItemEvent.metaItem}>｜</span>
          <span style={listItemEvent.metaItem}>駐車場：{event.parkingCapacity}台</span>
        </div>
        <div style={listItemEvent.info}>
          <div>🕒 {event.start}–{event.end}</div>
          <div>📍 {event.location}</div>
        </div>
        <div style={listItemEvent.participants}>
          {"😊 ".repeat(showCount)}
          {rest > 0 && <span>+{rest}</span>}
        </div>
      </div>
    </Link>
  );
}
