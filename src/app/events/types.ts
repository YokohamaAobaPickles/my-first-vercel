/**
 * イベント・参加者ダミーデータ用型（C群。API/DB は触らない）
 */

export type Member = {
  id: string;
  name: string;
  member_kind: string;
  icon?: string;
};

export type Event = {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  /** 検索用。任意 */
  description?: string;
  capacity: number;
  parkingCapacity: number;
  location: string;
  deadline: string;
  lotteryDone: boolean;
  /** 費用（円）。ダミー用 */
  fee?: number;
  parkingLotteryDone: boolean;

  applicants: Member[];
  participants: Member[];
  waitlist: Member[];

  parkingApplicants: Member[];
  parking: Member[];
  parkingWaitlist: Member[];

  userStatus: "未申請" | "申請中" | "参加確定" | "キャンセル待ち";
  userParking: "未申請" | "申請中" | "確定" | "キャンセル待ち" | "無し";
};
