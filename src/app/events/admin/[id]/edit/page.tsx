"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { baseStyles } from "@/types/styles/style_common";
import { adminEventForm } from "@/style/style_event_admin";
import { adminCommon } from "@/style/style_admin_common";
import ConfirmModal from "@/components/common/ConfirmModal";
import { STATUS, type StatusType } from "@/constants/status";
import AdminEventForm from "../../components/AdminEventForm";
import type { EventFormValues } from "../../components/AdminEventForm";
import { getEventById } from "../../../dummyData";
import type { Event } from "../../../types";

function eventToFormValues(event: Event): EventFormValues {
  const deadline =
    event.deadline && event.deadline.includes("T")
      ? event.deadline.slice(0, 16)
      : event.deadline || "";
  return {
    title: event.title,
    date: event.date,
    startTime: event.start,
    endTime: event.end,
    location: event.location,
    capacity: event.capacity,
    parkingCapacity: event.parkingCapacity,
    deadline,
    notes: event.description ?? "",
    status: STATUS.DRAFT,
  };
}

export default function EventEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const event = id ? getEventById(id) : undefined;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 将来的に Event に status が追加されたらここで取得（暫定で event.status を優先）
  const eventStatus = ((event as any)?.status ?? STATUS.DRAFT) as StatusType;
  const isDeletable = eventStatus === STATUS.INVALID;

  const handleUpdate = (values: EventFormValues) => {
    console.log("update event (dummy):", values);
  };

  const handleDelete = () => {
    if (!event) return;
    console.log("削除:", event.id);
    router.push("/events/admin");
  };

  if (!event) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={baseStyles.content}>
          <p style={{ color: "#9CA3AF", marginTop: 40 }}>イベントが見つかりません。</p>
          <Link href="/events/admin" style={adminEventForm.backButton}>
            ＜ 戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={adminEventForm.backRow}>
          <Link href="/events/admin" style={adminEventForm.backButton}>
            ＜ 戻る
          </Link>
        </div>

        <AdminEventForm
          mode="edit"
          initialValues={eventToFormValues(event)}
          onSubmit={handleUpdate}
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
          >
            更新
          </button>
          <button
            type="button"
            style={adminCommon.deleteButton}
            onClick={() => {
              if (!isDeletable) {
                alert("ステータスが「無効」でないため削除できません。");
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
