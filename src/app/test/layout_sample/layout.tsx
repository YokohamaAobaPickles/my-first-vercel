// app/test/layout_sample/layout.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { container, getContentStyle } from "@/app/test/style/style_common";
import { bottomNav }          from "@/app/test/style/style_bottomnav";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // active 判定関数
  const isActive = (path: string) => pathname.startsWith(path);
  
  const [width, setWidth] = useState(500);

  useEffect(() => {
    setWidth(window.innerWidth); // 初期値設定
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const appliedStyle = getContentStyle(width);

  return (
    <div style={container}>
      <div style={appliedStyle}>{children}</div>

      {/* BottomNavigation */}
      <div style={bottomNav.container}>

        <Link
          href="/test/layout_sample/login"
          style={isActive("/test/layout_sample/login")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/login.svg"
            style={
              isActive("/test/layout_sample/login")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          ログイン
        </Link>

        <Link
          href="/test/layout_sample/member"
          style={isActive("/test/layout_sample/member")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img
            src="/test/icons/member.svg"
            style={
              isActive("/test/layout_sample/member")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          会員
        </Link>

        <Link
          href="/test/layout_sample/announcement"
          style={isActive("/test/layout_sample/announcement")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/announcement.svg"
            style={
              isActive("/test/layout_sample/announcement")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          お知らせ
        </Link>

        <Link
          href="/test/layout_sample/event"
          style={isActive("/test/layout_sample/event")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/event.svg"
            style={
              isActive("/test/layout_sample/event")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          イベント
        </Link>

        <Link
          href="/test/layout_sample/accounting"
          style={isActive("/test/layout_sample/accounting")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/accounting.svg"
            style={
              isActive("/test/layout_sample/accounting")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          会計
        </Link>

        <Link
          href="/test/layout_sample/game"
          style={isActive("/test/layout_sample/game")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/court.svg"
            style={
              isActive("/test/layout_sample/game")
                ? { ...bottomNav.icon, ...bottomNav.iconActive }
                : bottomNav.icon
            }
          />
          試合
        </Link>

        <Link
          href="/test/layout_sample/asset"
          style={isActive("/test/layout_sample/asset")
            ? { ...bottomNav.item, ...bottomNav.itemActive }
            : bottomNav.item}
        >
          <img src="/test/icons/asset.svg"
            style={
              isActive("/test/layout_sample/asset")
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
