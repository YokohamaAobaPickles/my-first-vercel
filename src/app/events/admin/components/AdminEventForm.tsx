/**
 * Filename: src/app/events/admin/components/AdminEventForm.tsx
 * Version: V1.1.0
 * Update: 2026-02-27
 * Remarks: V1.1.0 - onSubmit を Supabase createEvent 用に async 対応、submitting 表示
 */

"use client";

import { useState, useCallback } from "react";
import { adminEventForm } from "@/style/style_event_admin";
import { STATUS, type StatusType } from "@/constants/status";
import { baseStyles } from "@/types/styles/style_common";

export type EventFormValues = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  parkingCapacity: number;
  deadline: string;
  notes: string;
  status: StatusType;
};

const LOCATION_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "大場A", label: "大場A" },
  { value: "大場B", label: "大場B" },
  { value: "体育館", label: "体育館" },
];

const defaultValues: EventFormValues = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  capacity: 0,
  parkingCapacity: 0,
  deadline: "",
  notes: "",
   status: STATUS.DRAFT,
};

type AdminEventFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  submitting?: boolean;
};

export default function AdminEventForm({
  mode,
  initialValues,
  onSubmit,
  submitting = false,
}: AdminEventFormProps) {
  const [values, setValues] = useState<EventFormValues>(() => ({
    ...defaultValues,
    ...initialValues,
    capacity: initialValues?.capacity ?? 0,
    parkingCapacity: initialValues?.parkingCapacity ?? 0,
  }));

  const update = useCallback(<K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) return;
    void onSubmit(values);
  };

  const submitLabel = mode === "create" ? "作成" : "更新";

  return (
    <form style={adminEventForm.form} onSubmit={handleSubmit}>
      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-title">
          タイトル（必須）
        </label>
        <input
          id="admin-form-title"
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          style={adminEventForm.input}
          required
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-date">
          日付
        </label>
        <input
          id="admin-form-date"
          type="date"
          value={values.date}
          onChange={(e) => update("date", e.target.value)}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-start">
          開始時間
        </label>
        <input
          id="admin-form-start"
          type="time"
          value={values.startTime}
          onChange={(e) => update("startTime", e.target.value)}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-end">
          終了時間
        </label>
        <input
          id="admin-form-end"
          type="time"
          value={values.endTime}
          onChange={(e) => update("endTime", e.target.value)}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-location">
          場所
        </label>
        <select
          id="admin-form-location"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
          style={adminEventForm.select}
        >
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-capacity">
          定員
        </label>
        <input
          id="admin-form-capacity"
          type="number"
          min={0}
          value={values.capacity || ""}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            update("capacity", Number.isNaN(n) ? 0 : n);
          }}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-parking">
          駐車場キャパ
        </label>
        <input
          id="admin-form-parking"
          type="number"
          min={0}
          value={values.parkingCapacity || ""}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            update("parkingCapacity", Number.isNaN(n) ? 0 : n);
          }}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label}>ステータス</label>
        <select
          value={values.status}
          onChange={(e) => update("status", e.target.value as StatusType)}
          style={adminEventForm.select}
        >
          <option value={STATUS.DRAFT}>下書き</option>
          <option value={STATUS.PUBLISHED}>公開中</option>
          <option value={STATUS.INVALID}>無効</option>
        </select>
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-deadline">
          受付期限
        </label>
        <input
          id="admin-form-deadline"
          type="datetime-local"
          value={values.deadline}
          onChange={(e) => update("deadline", e.target.value)}
          style={adminEventForm.input}
        />
      </div>

      <div style={adminEventForm.field}>
        <label style={adminEventForm.label} htmlFor="admin-form-notes">
          備考
        </label>
        <textarea
          id="admin-form-notes"
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          style={adminEventForm.textarea}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="submit"
          style={baseStyles.primaryButton}
          disabled={submitting}
        >
          {submitting ? "送信中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
