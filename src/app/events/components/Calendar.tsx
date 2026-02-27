"use client";

import { calendar } from "@/style/style_event";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type CalendarProps = {
  year: number;
  month: number;
  daysWithEvents: Set<number>;
  selectedDay: number | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
};

export default function Calendar({
  year,
  month,
  daysWithEvents,
  selectedDay,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: CalendarProps) {
  const lastDate = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={calendar.wrap}>
      <div style={calendar.monthNav}>
        <button type="button" onClick={onPrevMonth} style={calendar.monthNavButton}>
          ＜ 前月
        </button>
        <span>
          {year}年{month}月
        </span>
        <button type="button" onClick={onNextMonth} style={calendar.monthNavButton}>
          翌月 ＞
        </button>
      </div>
      <div style={calendar.weekRow}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={calendar.weekDay}>
            {w}
          </div>
        ))}
      </div>
      <div style={calendar.dayGrid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} style={{ ...calendar.dayCell, ...calendar.dayCellEmpty }} />;
          }
          const hasEvent = daysWithEvents.has(day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDayClick(day)}
              style={{
                ...calendar.dayCell,
                ...(hasEvent ? calendar.dayCellHasEvent : {}),
                ...(isSelected ? calendar.dayCellSelected : {}),
                cursor: "pointer",
              }}
            >
              {day}
              {hasEvent && <span style={calendar.dayCellDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
