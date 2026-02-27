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
