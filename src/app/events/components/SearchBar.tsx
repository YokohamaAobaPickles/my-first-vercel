/**
 * Filename: src/app/events/components/SearchBar.tsx
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - 検索バーの初期実装
 */

"use client";

import { searchBar } from "@/style/style_event";

type SearchBarProps = {
  value: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onSearchChange,
  placeholder = "キーワード検索",
}: SearchBarProps) {
  return (
    <div style={searchBar.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        style={searchBar.input}
      />
    </div>
  );
}
