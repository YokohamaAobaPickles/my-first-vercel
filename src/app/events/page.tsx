"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { baseStyles } from "@/types/styles/style_common";
import { eventPage } from "@/style/style_event";
import Calendar from "./components/Calendar";
import EventCard from "./components/EventCard";
import SearchBar from "./components/SearchBar";
import FilterChips, { type FilterOption } from "./components/FilterChips";
import { getEventsByMonthYear, getEventsFuture, getEventsPast } from "./dummyData";
import type { Event } from "./types";

const CURRENT_USER_ID = "me";
const CAN_MANAGE_EVENTS = true;

const PAST_PARTICIPATION_OPTIONS: FilterOption[] = [
  { key: "all", label: "すべて" },
  { key: "joined", label: "参加したイベントのみ" },
  { key: "not_joined", label: "参加していないイベント" },
];

const FILTER_OPTIONS: FilterOption[] = [
  { key: "受付中", label: "受付中" },
  { key: "受付終了", label: "受付終了" },
  { key: "抽選前", label: "抽選前" },
  { key: "抽選済み", label: "抽選済み" },
  { key: "未申請", label: "未申請" },
  { key: "申請中", label: "申請中" },
  { key: "参加確定", label: "参加確定" },
  { key: "キャンセル待ち", label: "キャンセル待ち" },
  { key: "大場A", label: "大場A" },
  { key: "大場B", label: "大場B" },
  { key: "体育館", label: "体育館" },
  { key: "駐車場あり", label: "駐車場あり" },
  { key: "駐車場なし", label: "駐車場なし" },
];

function matchFilter(event: Event, filterKey: string): boolean {
  const now = new Date();
  const deadline = new Date(event.deadline);
  switch (filterKey) {
    case "受付中":
      return now < deadline;
    case "受付終了":
      return now >= deadline;
    case "抽選前":
      return now >= deadline && !event.lotteryDone;
    case "抽選済み":
      return event.lotteryDone;
    case "未申請":
      return event.userStatus === "未申請";
    case "申請中":
      return event.userStatus === "申請中";
    case "参加確定":
      return event.userStatus === "参加確定";
    case "キャンセル待ち":
      return event.userStatus === "キャンセル待ち";
    case "大場A":
      return event.location.includes("大場A");
    case "大場B":
      return event.location.includes("大場B");
    case "体育館":
      return event.location.includes("体育館");
    case "駐車場あり":
      return event.parkingCapacity > 0;
    case "駐車場なし":
      return event.parkingCapacity === 0;
    default:
      return true;
  }
}

function applyFilters(
  events: Event[],
  searchQuery: string,
  selectedFilters: string[]
): Event[] {
  let list = events;
  const q = searchQuery.trim();
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(lower) ||
        e.location.toLowerCase().includes(lower) ||
        (e.description ?? "").toLowerCase().includes(lower)
    );
  }
  selectedFilters.forEach((key) => {
    list = list.filter((e) => matchFilter(e, key));
  });
  return list;
}

function applySearchOnly(events: Event[], searchQuery: string): Event[] {
  const q = searchQuery.trim();
  if (!q) return events;
  const lower = q.toLowerCase();
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      e.location.toLowerCase().includes(lower) ||
      (e.description ?? "").toLowerCase().includes(lower)
  );
}

function matchParticipation(
  event: Event,
  filterKey: string,
  currentUserId: string
): boolean {
  const joined = event.participants.some((p) => p.id === currentUserId);
  if (filterKey === "all") return true;
  if (filterKey === "joined") return joined;
  if (filterKey === "not_joined") return !joined;
  return true;
}

const todayStart = (): Date => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

export default function EventsPage() {
  const [tab, setTab] = useState<"future" | "past">("future");
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [participationFilter, setParticipationFilter] = useState<string[]>(["all"]);

  const monthEventsRaw = useMemo(
    () => getEventsByMonthYear(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const today = useMemo(() => todayStart(), []);
  const monthEvents = useMemo(
    () =>
      monthEventsRaw.filter((e) => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      }),
    [monthEventsRaw, today]
  );
  const daysWithEvents = useMemo(() => {
    const set = new Set<number>();
    monthEvents.forEach((e) => {
      const d = new Date(e.date).getDate();
      set.add(d);
    });
    return set;
  }, [monthEvents]);

  const byDay = useMemo(() => {
    if (selectedDay === null) return monthEvents;
    return monthEvents.filter((e) => new Date(e.date).getDate() === selectedDay);
  }, [monthEvents, selectedDay]);

  const pastEvents = useMemo(() => getEventsPast(), []);

  const filteredEventsFuture = useMemo(
    () => applyFilters(byDay, searchQuery, selectedFilters),
    [byDay, searchQuery, selectedFilters]
  );

  const filteredEventsPast = useMemo(() => {
    let list = applySearchOnly(pastEvents, searchQuery);
    participationFilter.forEach((key) => {
      list = list.filter((e) => matchParticipation(e, key, CURRENT_USER_ID));
    });
    return list;
  }, [pastEvents, searchQuery, participationFilter]);

  const filteredEvents = tab === "future" ? filteredEventsFuture : filteredEventsPast;

  const handleFilterToggle = (filterKey: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterKey) ? prev.filter((k) => k !== filterKey) : [...prev, filterKey]
    );
  };

  const handleParticipationToggle = (filterKey: string) => {
    setParticipationFilter([filterKey]);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={eventPage.headerRow}>
          <h1 style={eventPage.headerTitle}>イベント</h1>
          {CAN_MANAGE_EVENTS && (
            <div style={eventPage.adminButtonWrap}>
              <Link href="/events/admin" style={eventPage.adminLink}>
                管理
              </Link>
            </div>
          )}
        </div>

        <div style={eventPage.tabs}>
          <button
            type="button"
            onClick={() => setTab("future")}
            style={{
              ...eventPage.tab,
              ...(tab === "future" ? eventPage.tabActive : {}),
            }}
          >
            今後のイベント
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            style={{
              ...eventPage.tab,
              ...(tab === "past" ? eventPage.tabActive : {}),
            }}
          >
            過去のイベント
          </button>
        </div>

        {tab === "future" && (
          <Calendar
            year={currentYear}
            month={currentMonth}
            daysWithEvents={daysWithEvents}
            selectedDay={selectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDayClick={(day) => setSelectedDay((d) => (d === day ? null : day))}
          />
        )}

        <SearchBar value={searchQuery} onSearchChange={setSearchQuery} />

        {tab === "future" && (
          <FilterChips
            options={FILTER_OPTIONS}
            selectedFilters={selectedFilters}
            onFilterToggle={handleFilterToggle}
          />
        )}
        {tab === "past" && (
          <FilterChips
            options={PAST_PARTICIPATION_OPTIONS}
            selectedFilters={participationFilter}
            onFilterToggle={handleParticipationToggle}
          />
        )}

        <div style={eventPage.monthHeader}>
          {tab === "future"
            ? selectedDay !== null
              ? `${currentYear}年${currentMonth}月${selectedDay}日`
              : `${currentYear}年${currentMonth}月`
            : "過去のイベント"}
        </div>
        <div style={eventPage.list}>
          {filteredEvents.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>イベントはありません。</p>
          ) : (
            filteredEvents.map((ev) => <EventCard key={ev.id} event={ev} />)
          )}
        </div>
      </div>
    </div>
  );
}
