import React from 'react';
import { container, content, card, cardInput, button, text } from "@/app/test/style/style_common";
import { loginPage } from "@/app/test/style/style_login";

export default function LoginPageSample() {
  return (
    <div style={container}>
      <div style={content}>

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
