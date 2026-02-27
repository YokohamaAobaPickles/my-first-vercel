/**
 * Filename: src/app/events/dummyData.ts
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - イベントダミーデータの初期実装
 */ 

import { Event, Member } from "./types";

const members: Member[] = [
  { id: "u1", name: "ユーザー1", member_kind: "一般" },
  { id: "u2", name: "ユーザー2", member_kind: "一般" },
  { id: "me", name: "自分", member_kind: "一般" },
  { id: "u4", name: "ユーザー4", member_kind: "一般" },
  { id: "u5", name: "ユーザー5", member_kind: "一般" },
  { id: "u6", name: "ユーザー6", member_kind: "一般" },
];

export const dummyEvents: Event[] = [
  {
    id: "ev1",
    date: "2026-02-17",
    start: "12:00",
    end: "15:00",
    title: "ピックルボール会",
    minLevel: "初級",
    maxLevel: "中級",
    genderRule: "制限なし",
    pairRule: "SOLO",
    capacity: 8,
    parkingCapacity: 2,
    location: "大場A",
    deadline: "2026-02-16T23:59:59",
    fee: 500,
    lotteryDone: true,
    parkingLotteryDone: true,
    applicants: [],
    participants: members.slice(0, 5),
    waitlist: [],
    parkingApplicants: [],
    parking: members.slice(0, 2),
    parkingWaitlist: [],
    userStatus: "未申請",
    userParking: "未申請",
  },
  {
    id: "ev2",
    date: "2026-02-19",
    start: "12:00",
    end: "15:00",
    title: "ピックルボール会",
    minLevel: "中級",
    maxLevel: "上級",
    genderRule: "男女ペア必須",
    pairRule: "PAIR_REQUIRED",
    capacity: 6,
    parkingCapacity: 3,
    location: "大場A",
    deadline: "2026-02-18T23:59:59",
    fee: 500,
    lotteryDone: true,
    parkingLotteryDone: true,
    applicants: [],
    participants: members.slice(0, 6),
    waitlist: [members[0]],
    parkingApplicants: [],
    parking: members.slice(0, 3),
    parkingWaitlist: [],
    userStatus: "未申請",
    userParking: "未申請",
  },
  {
    id: "ev3",
    date: "2026-02-25",
    start: "12:00",
    end: "15:00",
    title: "ピックルボール会",
    minLevel: "初級",
    maxLevel: "中級",
    genderRule: "制限なし",
    pairRule: "SOLO",
    capacity: 8,
    parkingCapacity: 2,
    location: "大場A",
    deadline: "2026-02-24T23:59:59",
    fee: 500,
    lotteryDone: false,
    parkingLotteryDone: false,
    applicants: members.slice(0, 5),
    participants: [],
    waitlist: [],
    parkingApplicants: members.slice(0, 2),
    parking: [],
    parkingWaitlist: [],
    userStatus: "申請中",
    userParking: "申請中",
  },
  {
    id: "ev4",
    date: "2026-03-01",
    start: "12:00",
    end: "15:00",
    title: "ピックルボール会",
    minLevel: "初級",
    maxLevel: "中級",
    genderRule: "女性限定",
    pairRule: "SOLO",
    capacity: 8,
    parkingCapacity: 2,
    location: "大場A",
    deadline: "2026-02-28T23:59:59",
    fee: 500,
    lotteryDone: false,
    parkingLotteryDone: false,
    applicants: [],
    participants: [],
    waitlist: [],
    parkingApplicants: [],
    parking: [],
    parkingWaitlist: [],
    userStatus: "未申請",
    userParking: "未申請",
  },
];

export function getEventById(id: string): Event | undefined {
  return dummyEvents.find((e) => e.id === id);
}

export function getMemberById(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getEventsByMonthYear(year: number, month: number): Event[] {
  return dummyEvents.filter((e) => {
    const [y, m] = e.date.split("-").map(Number);
    return y === year && m === month;
  });
}

const todayStart = (): Date => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

export function getEventsFuture(): Event[] {
  const today = todayStart();
  return dummyEvents.filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
}

export function getEventsPast(): Event[] {
  const today = todayStart();
  return dummyEvents.filter((e) => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });
}

// 参加申請ダミーレコード
export type ParticipantApplication = {
  eventId: string;
  userId: string;
  pairUserId?: string;
  parkingRequested: boolean;
};

const applications: ParticipantApplication[] = [];

export function applyForEvent(app: ParticipantApplication) {
  applications.push(app);
  console.log("applyForEvent (dummy)", app);
}
