"use client";

import { Event, Member } from "../types";
import { eventDetail, statusBadge } from "@/style/style_event";
import { button } from "@/style/style_common";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type StatusBadgeKey = keyof Omit<typeof statusBadge, "base">;

function formatDateDetail(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
}

function getDetailStatusBadges(event: Event): StatusBadgeKey[] {
  const now = new Date();
  const deadline = new Date(event.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(event.date);
  eventDay.setHours(0, 0, 0, 0);
  const isPastEvent = eventDay < today;
  const isFull = event.participants.length >= event.capacity;
  const badges: StatusBadgeKey[] = [];

  if (isPastEvent) {
    badges.push("終了");
  } else {
    if (now < deadline) badges.push("受付中");
    else badges.push("受付終了");
    if (now >= deadline && !event.lotteryDone) badges.push("抽選前");
    if (event.lotteryDone) badges.push("抽選済み");
    if (isFull) badges.push("満員");
  }
  if (event.userStatus === "参加確定") badges.push("参加確定");
  if (event.userStatus === "キャンセル待ち") badges.push("キャンセル待ち");
  return badges;
}

type DetailSectionsProps = {
  event: Event;
  currentUserId: string;
  onJoin: () => void;
  onCancelJoin: () => void;
  onParkingApply: () => void;
  onParkingCancel: () => void;
};

export default function DetailSections({
  event,
  currentUserId,
  onJoin,
  onCancelJoin,
  onParkingApply,
  onParkingCancel,
}: DetailSectionsProps) {
  const isFull = event.lotteryDone && event.participants.length >= event.capacity;
  const hasParkingSlot = event.parkingCapacity > 0;
  const parkingFull =
    event.parkingLotteryDone &&
    event.parking.length >= event.parkingCapacity;

  const showJoinButton =
    event.userStatus === "未申請" && (!isFull || true);
  const showCancelJoin =
    event.userStatus === "申請中" || event.userStatus === "参加確定";
  const showParkingApply =
    hasParkingSlot &&
    (event.userParking === "未申請" || event.userParking === "申請中") &&
    !parkingFull;
  const showParkingCancel =
    hasParkingSlot &&
    (event.userParking === "申請中" || event.userParking === "確定");
  const showParkingNone = hasParkingSlot && parkingFull && event.userParking === "未申請";

  const renderMember = (m: Member, isSelf: boolean) => (
    <span key={m.id} style={eventDetail.listItem}>
      {isSelf ? "😊 " : ""}{m.name}
    </span>
  );

  return (
    <>
      <article style={eventDetail.card}>
        <div style={eventDetail.dateRow}>{formatDateDetail(event.date)}</div>
        <div style={eventDetail.dateRow}>
          🕒 {event.start}–{event.end}
        </div>
        <div style={eventDetail.titleRow}>
          <h1 style={eventDetail.title}>{event.title}</h1>
          <div style={eventDetail.statusBadges}>
            {getDetailStatusBadges(event).map((key) => (
              <span key={key} style={{ ...statusBadge.base, ...statusBadge[key] }}>
                {key}
              </span>
            ))}
          </div>
        </div>
        <div style={eventDetail.dateRow}>
          定員{event.capacity}名 / 📍 {event.location}
        </div>

        <div style={eventDetail.buttonRow}>
          {showJoinButton && (
            <button
              type="button"
              onClick={onJoin}
              style={{ ...button.base, ...button.primary }}
            >
              参加申請
            </button>
          )}
          {showCancelJoin && (
            <button
              type="button"
              onClick={onCancelJoin}
              style={{ ...button.base, ...button.secondary }}
            >
              参加取消
            </button>
          )}
          {showParkingApply && (
            <button
              type="button"
              onClick={onParkingApply}
              style={{ ...button.base, ...button.primary }}
            >
              駐車場申請
            </button>
          )}
          {showParkingCancel && (
            <button
              type="button"
              onClick={onParkingCancel}
              style={{ ...button.base, ...button.secondary }}
            >
              駐車場取消
            </button>
          )}
          {showParkingNone && (
            <button
              type="button"
              disabled
              style={{ ...button.base, ...button.inactive }}
            >
              駐車場無し
            </button>
          )}
        </div>
      </article>

      <h2 style={eventDetail.sectionTitle}>参加者リスト</h2>
      <div style={eventDetail.list}>
        {(event.participants.length > 0 ? event.participants : event.applicants).map((m) =>
          renderMember(m, m.id === currentUserId)
        )}
        {event.participants.length === 0 && event.applicants.length === 0 && (
          <span style={eventDetail.listItem}>（なし）</span>
        )}
      </div>

      {event.waitlist.length > 0 && (
        <>
          <h2 style={eventDetail.sectionTitle}>キャンセル待ち</h2>
          <div style={eventDetail.list}>
            {event.waitlist.map((m, i) => (
              <span key={m.id} style={eventDetail.listItem}>
                {i + 1}. {m.name}
              </span>
            ))}
          </div>
        </>
      )}

      {event.parkingCapacity > 0 && (
        <>
          <h2 style={eventDetail.sectionTitle}>駐車場申請者</h2>
          <div style={eventDetail.list}>
            {(event.parking.length > 0 ? event.parking : event.parkingApplicants).map((m) =>
              renderMember(m, m.id === currentUserId)
            )}
            {event.parking.length === 0 && event.parkingApplicants.length === 0 && (
              <span style={eventDetail.listItem}>（なし）</span>
            )}
          </div>
          {event.parkingWaitlist.length > 0 && (
            <>
              <h2 style={eventDetail.sectionTitle}>駐車場キャンセル待ち</h2>
              <div style={eventDetail.list}>
                {event.parkingWaitlist.map((m, i) => (
                  <span key={m.id} style={eventDetail.listItem}>
                    {i + 1}. {m.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
