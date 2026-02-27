/**
 * Filename: src/app/events/admin/[id]/edit/page.tsx
 * Version: V1.1.0
 * Update: 2026-02-27
 * Remarks: V1.1.0 - fetchEventById/updateEvent/deleteEvent API 接続に変更
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { baseStyles } from "@/types/styles/style_common";
import { adminEventForm } from "@/style/style_event_admin";
import { adminCommon } from "@/style/style_admin_common";
import ConfirmModal from "@/components/common/ConfirmModal";
import { STATUS } from "@/constants/status";
import AdminEventForm from "../../components/AdminEventForm";
import type { EventFormValues } from "../../components/AdminEventForm";
import {
  fetchEventById,
  updateEvent,
  deleteEvent,
} from "@/lib/eventApi";
import type { Event as ApiEvent, EventUpdateInput } from "@/types/event";

function apiEventToFormValues(api: ApiEvent): EventFormValues {
  return {
    title: api.title,
    date: api.date,
    startTime: api.start_time,
    endTime: api.end_time,
    location: api.place,
    capacity: api.capacity ?? 0,
    parkingCapacity: api.parking_capacity ?? 0,
    deadline: "",
    notes: "",
    status: STATUS.DRAFT,
  };
}

function formValuesToEventUpdateInput(
  values: EventFormValues
): EventUpdateInput {
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

export default function EventEditPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = typeof params.id === "string" ? params.id : "";
  const eventId = Number(idParam);

  const [apiEvent, setApiEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!eventId || Number.isNaN(eventId)) {
      setError("イベントが見つかりません。");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await fetchEventById(eventId);
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError("イベントが見つかりません。");
        setLoading(false);
        return;
      }
      setApiEvent(result.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleUpdate = async (values: EventFormValues) => {
    if (!apiEvent) return;
    setError(null);
    setSubmitting(true);
    const input = formValuesToEventUpdateInput(values);
    const result = await updateEvent(apiEvent.event_id, input);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error?.message ?? "イベントの更新に失敗しました。");
      return;
    }
    router.push(`/events/${apiEvent.event_id}`);
  };

  const handleDelete = async () => {
    if (!apiEvent) return;
    setError(null);
    const result = await deleteEvent(apiEvent.event_id);
    if (!result.success) {
      setError(result.error?.message ?? "イベントの削除に失敗しました。");
      return;
    }
    setShowDeleteModal(false);
    router.push("/events/admin");
  };

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
          <Link href="/events/admin" style={adminEventForm.backButton}>
            ＜ 戻る
          </Link>
        </div>
      </div>
    );
  }

  const isDeletable = true;

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
          mode="edit"
          initialValues={apiEventToFormValues(apiEvent)}
          onSubmit={handleUpdate}
          submitting={submitting}
        />
        <div style={adminCommon.buttonRow}>
          <button
            type="button"
            style={adminCommon.cancelButton}
            onClick={() => router.back()}
          >
            キャンセル
          </button>
          <button
            type="button"
            style={adminCommon.updateButton}
            onClick={() => {
              const form = document.querySelector("form");
              if (form) {
                (form as HTMLFormElement).requestSubmit();
              }
            }}
            disabled={submitting}
          >
            更新
          </button>
          <button
            type="button"
            style={adminCommon.deleteButton}
            onClick={() => {
              if (!isDeletable) {
                alert(
                  "ステータスが「無効」でないため削除できません。"
                );
                return;
              }
              setShowDeleteModal(true);
            }}
          >
            削除
          </button>
        </div>

        <ConfirmModal
          open={showDeleteModal}
          title="イベントを削除しますか？"
          message="この操作は取り消せません。"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
