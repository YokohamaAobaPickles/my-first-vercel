"use client";

import { adminFilterPanel } from "@/style/style_event_admin";

export type FilterSection = {
  label: string;
  options: { key: string; label: string }[];
};

const ADMIN_FILTER_SECTIONS: FilterSection[] = [
  {
    label: "受付状態",
    options: [
      { key: "受付中", label: "受付中" },
      { key: "受付終了", label: "受付終了" },
      { key: "抽選前", label: "抽選前" },
      { key: "抽選済み", label: "抽選済み" },
    ],
  },
  {
    label: "イベント状態",
    options: [
      { key: "開催前", label: "開催前" },
      { key: "終了", label: "終了" },
    ],
  },
  {
    label: "定員状況",
    options: [
      { key: "空きあり", label: "空きあり" },
      { key: "満員", label: "満員" },
    ],
  },
  {
    label: "駐車場",
    options: [
      { key: "駐車場あり", label: "あり" },
      { key: "駐車場なし", label: "なし" },
    ],
  },
  {
    label: "抽選",
    options: [{ key: "抽選必要", label: "抽選必要イベント" }],
  },
  {
    label: "日付範囲",
    options: [
      { key: "今月", label: "今月" },
      { key: "来月", label: "来月" },
      { key: "過去", label: "過去" },
      { key: "任意", label: "任意" },
    ],
  },
];

type AdminFilterPanelProps = {
  open: boolean;
  onClose: () => void;
  selectedFilters: string[];
  onFilterToggle: (filterKey: string) => void;
};

export default function AdminFilterPanel({
  open,
  onClose,
  selectedFilters,
  onFilterToggle,
}: AdminFilterPanelProps) {
  if (!open) return null;

  return (
    <>
      <div style={adminFilterPanel.overlay} onClick={onClose} aria-hidden />
      <div style={adminFilterPanel.panel}>
        <h2 style={adminFilterPanel.panelTitle}>フィルタ</h2>
        {ADMIN_FILTER_SECTIONS.map((section) => (
          <div key={section.label} style={adminFilterPanel.section}>
            <div style={adminFilterPanel.sectionLabel}>{section.label}</div>
            <div style={adminFilterPanel.chipRow}>
              {section.options.map(({ key, label }) => {
                const selected = selectedFilters.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onFilterToggle(key)}
                    style={{
                      ...adminFilterPanel.chip,
                      ...(selected ? adminFilterPanel.chipSelected : {}),
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onClose}
          style={adminFilterPanel.closeButton}
        >
          閉じる
        </button>
      </div>
    </>
  );
}
