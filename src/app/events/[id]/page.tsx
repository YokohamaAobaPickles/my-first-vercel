"use client";

import { useParams, useRouter } from "next/navigation";
import { baseStyles } from "@/types/styles/style_common";
import { eventDetail } from "@/style/style_event";
import DetailSections from "../components/DetailSections";
import { getEventById } from "../dummyData";

const CURRENT_USER_ID = "me";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const event = id ? getEventById(id) : undefined;

  if (!event) {
    return (
      <div style={baseStyles.containerDefault}>
        <div style={baseStyles.content}>
          <p style={{ color: "#9CA3AF", marginTop: 40 }}>イベントが見つかりません。</p>
          <button onClick={() => router.back()} style={baseStyles.primaryButton}>
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyles.containerDefault}>
      <div style={baseStyles.content}>
        <div style={eventDetail.header}>
          <button
            type="button"
            onClick={() => router.back()}
            style={eventDetail.backButton}
          >
            ＜ 戻る
          </button>
        </div>

        <DetailSections
          event={event}
          currentUserId={CURRENT_USER_ID}
          onJoin={() => {}}
          onCancelJoin={() => {}}
          onParkingApply={() => {}}
          onParkingCancel={() => {}}
        />
      </div>
    </div>
  );
}
