/**
 * Filename: src/app/components/BottomNavigation.tsx
 * Version : V1.6.0
 * Update  : 2026-03-14
 * Remarks : 
 * V1.6.0 - 新しいメニュー
 * V1.5.0 - ログインしていない場合はメニューを非表示にするガードを追加。
 * V1.4.2 - SVGインライン化によりインポートエラーを解消。
 * V1.4.1 - SVGインライン化。currentColorによるアクティブカラー制御。
 * V1.2.0 - SVGアイコン採用。CSSによる動的な色変更に対応。
 * V1.0.0 - 5項目メニューの実装。テストV1.1.0に対応。
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { container, getContentStyle } from "@/app/test/style/style_common";
import { bottomNav } from "@/app/test/style/style_bottomnav";

export default function BottomNavigationClient() {
  const pathname = usePathname();
  // ★ 追加：ログインページでは非表示
  if (pathname === "/login") {
    return null;
  }
  
  const isActive = (path: string) => pathname.startsWith(path);

  const [width, setWidth] = useState(500);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const appliedStyle = getContentStyle(width);

  return (
    <div style={container}>
      <div style={appliedStyle}></div>

      <div style={bottomNav.container}>

        <Link
          href="/members/profile"
          style={isActive("/members/profile")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img
            src="/test/icons/member.svg"
            style={
              isActive("/members/profile")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          会員
        </Link>

        <Link
          href="/announcements"
          style={isActive("/announcements")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/announcement.svg"
            style={
              isActive("/announcements")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          お知らせ
        </Link>

        <Link
          href="/events"
          style={isActive("/events")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/event.svg"
            style={
              isActive("/events")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          イベント
        </Link>

        <Link
          href="/accounting"
          style={isActive("/accounting")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/accounting.svg"
            style={
              isActive("/accounting")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          会計
        </Link>

        <Link
          href="/game_support"
          style={isActive("/game_support")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/court.svg"
            style={
              isActive("/game_support")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          試合
        </Link>

        <Link
          href="/facilities"
          style={isActive("/facilities")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/asset.svg"
            style={
              isActive("/facilities")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          設備
        </Link>

      </div>
    </div>
  );
}
