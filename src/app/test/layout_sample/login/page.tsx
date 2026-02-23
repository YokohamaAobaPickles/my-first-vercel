// app/test/layout_sample/login/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { container, getContentStyle, card, cardInput, button, text } from "@/app/test/style/style_common";
import { loginPage } from "@/app/test/style/style_login";

export default function LoginPageSample() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth); // 初期値設定
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={container}>
      <div style={getContentStyle(width)}>
        
        {/* タイトル */}
        <h2 style={loginPage.title}>ログイン</h2>
        {/* <h2 style={text.title}>ログイン</h2> */}

        {/* カード */}
        <div style={{ ...card, ...loginPage.card }}>

          {/* メールアドレス */}
          <div style={cardInput.wrapper}>
            <div style={cardInput.label}>メールアドレス</div>
            <input type="email" style={cardInput.inputWrapper} placeholder="example@mail.com" />
          </div>

          {/* パスワード */}
          <div style={cardInput.wrapper}>
            <div style={cardInput.label}>パスワード</div>
            <input type="password" style={cardInput.inputWrapper} placeholder="••••••••" />
          </div>

          {/* ログインボタン */}
          <button style={{ ...button.base, ...button.primary }}>ログイン</button>

          {/* パスワード忘れ */}
          <div style={loginPage.forgot}>パスワードをお忘れですか？</div>

          <a href="/test" style={text.link}>
            サンプルに戻る
          </a>
        </div>

      </div>
    </div>
  );
}
