/**
 * Filename: src/app/events/[id]/page.tsx
 * Version: V1.2.0
 * Update: 2026-02-27
 * Remarks: V1.2.0 - 抽選/キャンセル待ちに応じたボタン・状態表示、フォーカス時再取得
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { baseStyles } from "@/types/styles/style_common";
import { eventDetail } from "@/style/style_event";
import DetailSections from "../components/DetailSections";
import {
  fetchEventById,
  fetchParticipant,
  fetchParticipantsByEvent,
} from "@/lib/eventApi";
import type { Event as ApiEvent, Participant } from "@/types/event";
import type { Event as ViewEvent, Member } from "../types";

const CURRENT_USER_ID = "me";

function isLotteryClosed(eventDateStr: string): boolean {
  const deadline = new Date(eventDateStr);
  deadline.setHours(23, 59, 59, 999);
  return new Date() > deadline;
}

function placeholderMembers(count: number, prefix: string): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    name: "",
    member_kind: "",
  }));
}

function mapApiEventToView(
  api: ApiEvent,
  participant: Participant | null,
  participantsList: Participant[]
): ViewEvent {
  const userStatus: ViewEvent["userStatus"] =
    participant?.status === "confirmed"
      ? "参加確定"
      : participant
      ? "申請中"
      : "未申請";

  const userParking: ViewEvent["userParking"] =
    !participant || !participant.parking_requested
      ? "未申請"
      : participant.parking === true
      ? "確定"
      : participant.parking === false
      ? "無し"
      : "申請中";

  const confirmedCount = participantsList.filter(
    (p) => p.status === "confirmed"
  ).length;
  const pendingCount = participantsList.filter(
    (p) => p.status === "pending"
  ).length;
  const capacity = api.capacity ?? 0;

  const lotteryDone = isLotteryClosed(api.date);

  return {
    id: String(api.event_id),
    date: api.date,
    start: api.start_time,
    end: api.end_time,
    title: api.title,
    description: undefined,
    capacity,
    parkingCapacity: api.parking_capacity ?? 0,
    location: api.place,
    deadline: api.date,
    lotteryDone,
    fee: undefined,
    parkingLotteryDone: false,
    applicants: placeholderMembers(pendingCount, "applicant"),
    participants: placeholderMembers(confirmedCount, "participant"),
    waitlist: [],
    parkingApplicants: [],
    parking: [],
    parkingWaitlist: [],
    userStatus,
    userParking,
  };
}

function getWaitlistOrder(
  participantsList: Participant[],
  currentUserId: string
): number | null {
  const pending = participantsList
    .filter((p) => p.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime()
    );
  const idx = pending.findIndex((p) => p.user_id === currentUserId);
  return idx >= 0 ? idx + 1 : null;
}

function loadData(
  id: number,
  setApiEvent: (e: ApiEvent | null) => void,
  setParticipant: (p: Participant | null) => void,
  setParticipantsList: (p: Participant[]) => void,
  setLoading: (v: boolean) => void,
  setError: (s: string | null) => void,
  silent = false
) {
  if (!silent) setLoading(true);
  setError(null);
  Promise.all([
    fetchEventById(id),
    fetchParticipant(id, CURRENT_USER_ID),
    fetchParticipantsByEvent(id),
  ]).then(([eventRes, participantRes, participantsRes]) => {
    if (!eventRes.success || !eventRes.data) {
      setError("イベントが見つかりません。");
      setApiEvent(null);
      setParticipant(null);
      setParticipantsList([]);
      setLoading(false);
      return;
    }
    setApiEvent(eventRes.data);
    setParticipant(participantRes.success ? participantRes.data ?? null : null);
    setParticipantsList(
      participantsRes.success && participantsRes.data
        ? participantsRes.data
        : []
    );
    setLoading(false);
  });
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = typeof params.id === "string" ? params.id : "";

  const [apiEvent, setApiEvent] = useState<ApiEvent | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = parseInt(idParam, 10);
    if (!idParam || Number.isNaN(id)) {
      setError("イベントが見つかりません。");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      const [eventRes, participantRes, participantsRes] = await Promise.all([
        fetchEventById(id),
        fetchParticipant(id, CURRENT_USER_ID),
        fetchParticipantsByEvent(id),
      ]);

      if (cancelled) return;

      if (!eventRes.success || !eventRes.data) {
        setError("イベントが見つかりません。");
        setLoading(false);
        return;
      }

      setApiEvent(eventRes.data);
      if (participantRes.success) {
        setParticipant(participantRes.data ?? null);
      }
      if (participantsRes.success && participantsRes.data) {
        setParticipantsList(participantsRes.data);
      } else {
        setParticipantsList([]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [idParam]);

  useEffect(() => {
    const id = parseInt(idParam, 10);
    if (Number.isNaN(id) || !idParam) return;
    const onFocus = () => {
      loadData(
        id,
        setApiEvent,
        setParticipant,
        setParticipantsList,
        setLoading,
        setError,
        true
      );
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [idParam]);

  if (loading) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={baseStyles.content}>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !apiEvent) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={baseStyles.content}>
          <p style={{ color: "#9CA3AF", marginTop: 40 }}>
            {error ?? "イベントが見つかりません。"}
          </p>
          <button onClick={() => router.back()} style={baseStyles.primaryButton}>
            戻る
          </button>
        </div>
      </div>
    );
  }

  const viewEvent = mapApiEventToView(
    apiEvent,
    participant,
    participantsList
  );

  const capacity = apiEvent.capacity ?? 0;
  const confirmedCount = participantsList.filter(
    (p) => p.status === "confirmed"
  ).length;
  const lotteryClosed = isLotteryClosed(apiEvent.date);
  const hasSpace = confirmedCount < capacity;
  const waitlistOrder = getWaitlistOrder(
    participantsList,
    CURRENT_USER_ID
  );

  let actionLabel = "参加する";
  let statusText: string | null = null;

  if (!participant || participant.status === "canceled" || participant.status === "invalid") {
    if (lotteryClosed) {
      actionLabel = hasSpace
        ? "参加を申し込む（即時確定）"
        : "キャンセル待ちとして申し込む";
    } else {
      actionLabel = "抽選に申し込む（定員に関わらず受付）";
    }
  } else if (participant.status === "pending") {
    actionLabel = "申請内容を確認・変更する";
    if (waitlistOrder !== null) {
      statusText = `キャンセル待ち${waitlistOrder}番目`;
    } else {
      statusText = "申請中（抽選待ち）";
    }
  } else if (participant.status === "confirmed") {
    actionLabel = "参加状況を確認する";
    statusText = "参加確定";
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={eventDetail.header}>
          <button
            type="button"
            onClick={() => router.back()}
            style={eventDetail.backButton}
          >
            ＜ 戻る
          </button>
        </div>

        <DetailSections event={viewEvent} currentUserId={CURRENT_USER_ID} />
        {statusText && (
          <p style={{ marginTop: 16, fontSize: 14, color: "#6B7280" }}>
            {statusText}
          </p>
        )}
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            style={baseStyles.primaryButton}
            onClick={() => router.push(`/events/${viewEvent.id}/apply`)}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
