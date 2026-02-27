/**
 * Filename: src/utils/eventHelpers.ts
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - イベント抽選・参加ステータス判定の純粋関数
 */

import type { Event, Participant } from "@/types/event";

/**
 * 申込期限（event.date の 23:59:59.999）を過ぎているか。
 * @param eventDate YYYY-MM-DD
 * @param referenceDate 判定基準日時（省略時は現在）
 */
export function isLotteryClosed(
  eventDate: string,
  referenceDate?: Date
): boolean {
  const deadline = new Date(eventDate);
  deadline.setHours(23, 59, 59, 999);
  const now = referenceDate ?? new Date();
  return now > deadline;
}

export type ParticipantStatusResult = {
  status: "pending" | "confirmed";
  parking: boolean | null;
};

/**
 * 参加申込時のステータス・駐車場当選を算出する。
 * 抽選前は常に pending / parking=null。
 * 抽選後は定員・駐車定員に応じて confirmed または pending。
 *
 * @param event イベント（date, capacity, parking_capacity を使用）
 * @param participants 既存参加者一覧
 * @param requestedParking 駐車場を希望するか
 * @param referenceDate 判定基準日時（省略時は現在）
 */
export function calculateParticipantStatus(
  event: Pick<Event, "date" | "capacity" | "parking_capacity">,
  participants: Pick<Participant, "status" | "parking">[],
  requestedParking: boolean,
  referenceDate?: Date
): ParticipantStatusResult {
  const lotteryClosed = isLotteryClosed(event.date, referenceDate);
  const capacity = event.capacity ?? 0;
  const confirmedCount = participants.filter(
    (p) => p.status === "confirmed"
  ).length;
  const parkingCapacity = event.parking_capacity ?? 0;
  const parkingConfirmedCount = participants.filter(
    (p) => p.parking === true
  ).length;

  let status: "pending" | "confirmed" = "pending";
  let parking: boolean | null = null;

  if (lotteryClosed) {
    if (confirmedCount < capacity) {
      status = "confirmed";
    }
    if (requestedParking) {
      parking = parkingConfirmedCount < parkingCapacity;
    }
  }

  return { status, parking };
}
