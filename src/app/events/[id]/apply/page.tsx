/**
 * Filename: src/app/events/[id]/apply/page.tsx
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - イベント参加申請ページの初期実装
 */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { baseStyles } from "@/types/styles/style_common";
import { eventApply } from "@/style/style_event";
import {
  getEventById,
  getMemberById,
  applyForEvent,
} from "../../dummyData";

const CURRENT_USER_ID = "me";

export default function EventApplyPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const event = id ? getEventById(id) : undefined;
  const me = getMemberById(CURRENT_USER_ID);

  const [pairMemberId, setPairMemberId] = useState("");
  const [parkingRequested, setParkingRequested] = useState(false);

  if (!event) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={baseStyles.content}>
          <p style={{ color: "#9CA3AF", marginTop: 40 }}>イベントが見つかりません。</p>
          <button
            type="button"
            style={baseStyles.primaryButton}
            onClick={() => router.back()}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const isPairEvent = event.pairRule === "PAIR_REQUIRED";
  const hasParking = event.parkingCapacity > 0;

  // dummyData の配列を使って参加状況を判定（仮実装）
  const meInApplicants = event.applicants.some((m) => m.id === CURRENT_USER_ID);
  const meInParticipants = event.participants.some((m) => m.id === CURRENT_USER_ID);
  const meInWaitlist = event.waitlist.some((m) => m.id === CURRENT_USER_ID);
  const meInParkingApplicants = event.parkingApplicants.some(
    (m) => m.id === CURRENT_USER_ID
  );
  const meInParking = event.parking.some((m) => m.id === CURRENT_USER_ID);
  const meInParkingWaitlist = event.parkingWaitlist.some(
    (m) => m.id === CURRENT_USER_ID
  );

  const hasAnyRecord =
    meInApplicants ||
    meInParticipants ||
    meInWaitlist ||
    meInParkingApplicants ||
    meInParking ||
    meInParkingWaitlist;

  const status = event.userStatus;
  const isApplied =
    status === "申請中" || status === "参加確定" || status === "キャンセル待ち";

  const isEditMode = isApplied;
  const isReapplyMode = !isEditMode && hasAnyRecord;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    applyForEvent({
      eventId: event.id,
      userId: CURRENT_USER_ID,
      pairUserId: isPairEvent && pairMemberId ? pairMemberId : undefined,
      parkingRequested,
    });
    alert("参加申請を受け付けました（ダミー）");
    router.push(`/events/${event.id}`);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    applyForEvent({
      eventId: event.id,
      userId: CURRENT_USER_ID,
      pairUserId: isPairEvent && pairMemberId ? pairMemberId : undefined,
      parkingRequested,
    });
    alert("申請内容を更新しました（ダミー）");
    router.push(`/events/${event.id}`);
  };

  const handleCancel = () => {
    alert("申請をキャンセルしました（ダミー）");
    router.push(`/events/${event.id}`);
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <form onSubmit={isEditMode ? handleUpdate : handleCreate}>
          <div style={eventApply.section}>
            <div style={eventApply.row}>
              <span style={eventApply.label}>自分の名前</span>
              <span style={eventApply.value}>{me?.name ?? "自分"}</span>
            </div>
            <div style={eventApply.row}>
              <span style={eventApply.label}>イベント名</span>
              <span style={eventApply.value}>{event.title}</span>
            </div>
            <div style={eventApply.row}>
              <span style={eventApply.label}>日時</span>
              <span style={eventApply.value}>
                {event.date} {event.start}〜{event.end}
              </span>
            </div>
            <div style={eventApply.row}>
              <span style={eventApply.label}>場所</span>
              <span style={eventApply.value}>{event.location}</span>
            </div>
          </div>

          {isPairEvent ? (
            <div style={eventApply.section}>
              <div style={eventApply.row}>
                <span style={eventApply.label}>ペア相手の member-id</span>
                <input
                  type="text"
                  value={pairMemberId}
                  onChange={(e) => setPairMemberId(e.target.value)}
                  style={eventApply.input}
                />
              </div>
              <div style={eventApply.row}>
                <span style={eventApply.note}>
                  ペアが相互に指定されない場合、申込は無効になります。
                </span>
              </div>
              {hasParking && (
                <label style={eventApply.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={parkingRequested}
                    onChange={(e) => setParkingRequested(e.target.checked)}
                  />
                  駐車場を希望する
                </label>
              )}
            </div>
          ) : (
            <div style={eventApply.section}>
              {hasParking && (
                <label style={eventApply.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={parkingRequested}
                    onChange={(e) => setParkingRequested(e.target.checked)}
                  />
                  駐車場を希望する
                </label>
              )}
            </div>
          )}

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button type="submit" style={baseStyles.primaryButton}>
              {isEditMode
                ? "申請内容を更新する"
                : isReapplyMode
                ? "再申請する"
                : "参加申請する"}
            </button>
            {isEditMode && (
              <button
                type="button"
                style={baseStyles.secondaryButton}
                onClick={handleCancel}
              >
                キャンセルする
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

