"use client";

import Link from "next/link";
import { baseStyles } from "@/types/styles/style_common";
import { adminEventForm } from "@/style/style_event_admin";
import AdminEventForm from "../components/AdminEventForm";
import type { EventFormValues } from "../components/AdminEventForm";

export default function EventNewPage() {
  const handleSubmit = (values: EventFormValues) => {
    console.log("create event (dummy):", values);
  };

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={adminEventForm.backRow}>
          <Link href="/events/admin" style={adminEventForm.backButton}>
            ＜ 戻る
          </Link>
        </div>

        <AdminEventForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
