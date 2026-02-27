/**
 * Filename: src/app/events/admin/new/page.tsx
 * Version: V1.1.1
 * Update: 2026-02-27
 * Remarks: V1.1.1 - createEvent API 経由に変更（テストファースト・API層経由に統一）
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { baseStyles } from "@/types/styles/style_common";
import { adminEventForm } from "@/style/style_event_admin";
import AdminEventForm from "../components/AdminEventForm";
import type { EventFormValues } from "../components/AdminEventForm";
import { createEvent } from "@/lib/eventApi";
import type { EventInput } from "@/types/event";

function formValuesToEventInput(values: EventFormValues): EventInput {
  return {
    title: values.title.trim(),
    date: values.date,
    start_time: values.startTime,
    end_time: values.endTime,
    place: values.location,
    capacity: values.capacity,
    min_level: null,
    max_level: null,
    gender_rule: "none",
    pair_rule: "solo",
    parking_capacity: values.parkingCapacity,
  };
}

export default function EventNewPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: EventFormValues) => {
    setError(null);
    setSubmitting(true);
    const input = formValuesToEventInput(values);
    const result = await createEvent(input);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error?.message ?? "イベントの作成に失敗しました。");
      return;
    }
    if (result.data?.event_id != null) {
      router.push(`/events/${result.data.event_id}`);
    } else {
      router.push("/events/admin");
    }
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={adminEventForm.backRow}>
          <Link href="/events/admin" style={adminEventForm.backButton}>
            ＜ 戻る
          </Link>
        </div>

        {error && (
          <p style={{ color: "#DC2626", marginBottom: 16 }}>{error}</p>
        )}

        <AdminEventForm
          mode="create"
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
