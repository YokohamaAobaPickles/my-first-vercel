/**
 * Filename: src/app/events/admin/page.tsx
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - 管理者向けイベント一覧ページの初期実装
 */

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { baseStyles } from "@/types/styles/style_common";
import { adminPage, adminFilterPanel } from "@/style/style_event_admin";
import { searchBar } from "@/style/style_event";
import Calendar from "../components/Calendar";
import SearchBar from "../components/SearchBar";
import AdminFilterPanel from "./components/AdminFilterPanel";
import AdminEventCard from "./components/AdminEventCard";
import {
  getEventsByMonthYear,
  getEventsFuture,
  getEventsPast,
} from "../dummyData";
import type { Event } from "../types";

function todayStart(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function matchAdminFilter(event: Event, filterKey: string): boolean {
  const now = new Date();
  const deadline = new Date(event.deadline);
  const eventDay = new Date(event.date);
  eventDay.setHours(0, 0, 0, 0);
  const today = todayStart();

  switch (filterKey) {
    case "受付中":
      return now < deadline;
    case "受付終了":
      return now >= deadline;
    case "抽選前":
      return now >= deadline && !event.lotteryDone;
    case "抽選済み":
      return event.lotteryDone;
    case "開催前":
      return eventDay >= today;
    case "終了":
      return eventDay < today;
    case "空きあり":
      return event.participants.length < event.capacity;
    case "満員":
      return event.participants.length >= event.capacity;
    case "駐車場あり":
      return event.parkingCapacity > 0;
    case "駐車場なし":
      return event.parkingCapacity === 0;
    case "抽選必要":
      return now >= deadline && !event.lotteryDone;
    case "今月": {
      const [y, m] = event.date.split("-").map(Number);
      const ty = today.getFullYear();
      const tm = today.getMonth() + 1;
      return y === ty && m === tm;
    }
    case "来月": {
      const [y, m] = event.date.split("-").map(Number);
      const ty = today.getFullYear();
      const tm = today.getMonth() + 1;
      const nextMonth = tm === 12 ? 1 : tm + 1;
      const nextYear = tm === 12 ? ty + 1 : ty;
      return y === nextYear && m === nextMonth;
    }
    case "過去":
      return eventDay < today;
    case "任意":
      return true;
    default:
      return true;
  }
}

function applyAdminFilters(
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
    list = list.filter((e) => matchAdminFilter(e, key));
  });
  return list;
}

export default function EventsAdminPage() {
  const [tab, setTab] = useState<"future" | "past">("future");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const today = useMemo(() => todayStart(), []);
  const monthEventsRaw = useMemo(
    () => getEventsByMonthYear(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
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
      set.add(new Date(e.date).getDate());
    });
    return set;
  }, [monthEvents]);

  const byDay = useMemo(() => {
    if (selectedDay === null) return monthEvents;
    return monthEvents.filter(
      (e) => new Date(e.date).getDate() === selectedDay
    );
  }, [monthEvents, selectedDay]);

  const pastEvents = useMemo(() => getEventsPast(), []);

  const filteredFuture = useMemo(
    () => applyAdminFilters(byDay, searchQuery, selectedFilters),
    [byDay, searchQuery, selectedFilters]
  );
  const filteredPast = useMemo(
    () => applyAdminFilters(pastEvents, searchQuery, selectedFilters),
    [pastEvents, searchQuery, selectedFilters]
  );
  const filteredEvents = tab === "future" ? filteredFuture : filteredPast;

  const handleFilterToggle = (filterKey: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((k) => k !== filterKey)
        : [...prev, filterKey]
    );
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={adminPage.headerRow}>
          <h1 style={adminPage.headerTitle}>イベント管理</h1>
          <div style={adminPage.newButtonWrap}>
            <Link href="/events/admin/new" style={adminPage.newLink}>
              新規作成
            </Link>
          </div>
        </div>

        <div style={adminPage.tabs}>
          <button
            type="button"
            onClick={() => setTab("future")}
            style={{
              ...adminPage.tab,
              ...(tab === "future" ? adminPage.tabActive : {}),
            }}
          >
            今後のイベント
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            style={{
              ...adminPage.tab,
              ...(tab === "past" ? adminPage.tabActive : {}),
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
            onDayClick={(day) =>
              setSelectedDay((d) => (d === day ? null : day))
            }
          />
        )}

        <SearchBar value={searchQuery} onSearchChange={setSearchQuery} />

        <button
          type="button"
          onClick={() => setFilterPanelOpen(true)}
          style={adminFilterPanel.triggerButton}
        >
          フィルタ
        </button>
        <AdminFilterPanel
          open={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          selectedFilters={selectedFilters}
          onFilterToggle={handleFilterToggle}
        />

        <div style={adminPage.monthHeader}>
          {tab === "future"
            ? selectedDay !== null
              ? `${currentYear}年${currentMonth}月${selectedDay}日`
              : `${currentYear}年${currentMonth}月`
            : "過去のイベント"}
        </div>
        <div style={adminPage.list}>
          {filteredEvents.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>
              イベントはありません。
            </p>
          ) : (
            filteredEvents.map((ev) => (
              <AdminEventCard key={ev.id} event={ev} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
