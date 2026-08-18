export function forbiddenPage() {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Доступ запрещён</title>
  <style>
    :root {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #064929;
      background: #F2F9ED;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(180deg, #F2F9ED 0%, #FFFFFF 100%);
    }

    .page {
      width: min(100%, 680px);
      padding: 32px;
      background: #FFFFFF;
      border: 1px solid rgba(6, 73, 41, 0.12);
      border-radius: 30px;
      box-shadow: 0 32px 80px rgba(6, 73, 41, 0.08);
    }

    .label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #40AD52;
      margin-bottom: 24px;
    }

    .label::before {
      content: "";
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: #40AD52;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.05;
      color: #064929;
    }

    p {
      margin: 24px 0 32px;
      line-height: 1.8;
      color: #334155;
      font-size: 1rem;
    }

    strong {
      color: #064929;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 24px;
      border-radius: 999px;
      background: #40AD52;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 18px 30px rgba(64, 173, 82, 0.24);
    }

    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 22px 34px rgba(64, 173, 82, 0.28);
    }

    .hint {
      margin-top: 20px;
      color: #64748B;
      font-size: 0.95rem;
    }

    @media (max-width: 640px) {
      .page {
        padding: 24px;
      }
      h1 {
        font-size: 2.2rem;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="label">Доступ запрещён</div>
    <h1>Эта страница доступна только для авторизованных пользователей.</h1>
    <p>Пожалуйста, войдите в систему с разрешённым аккаунтом или вернитесь на главную страницу.</p>
    <a class="button" href="/">Вернуться на главную</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 403,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}