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
  /** 推奨レベル帯（例: 初級〜中級） */
  minLevel?: string;
  maxLevel?: string;
  /** 性別条件（例: 女性限定／ペアなどの説明用） */
  genderRule?: string;
  /** 申込形態: ソロ or ペア必須 */
  pairRule?: "SOLO" | "PAIR_REQUIRED";
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
