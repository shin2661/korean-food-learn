import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    return next();
  }

  const runtimeEnv = (context.locals as any).runtime?.env ?? {};
  const adminSecret: string | undefined = runtimeEnv.ADMIN_SECRET || import.meta.env.ADMIN_SECRET;

  // ADMIN_SECRET이 설정되지 않은 경우 접근 차단 (프로덕션 안전장치)
  if (!adminSecret) {
    return new Response('ADMIN_SECRET is not configured.', { status: 503 });
  }

  // 쿠키 확인
  const cookie = context.cookies.get('admin_token');
  if (cookie?.value === adminSecret) {
    return next();
  }

  // 로그인 폼 POST 처리
  if (context.request.method === 'POST' && pathname === '/admin/login') {
    const form = await context.request.formData();
    const token = form.get('token')?.toString() ?? '';

    if (token === adminSecret) {
      const response = context.redirect('/admin');
      response.headers.append(
        'Set-Cookie',
        `admin_token=${adminSecret}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=86400`,
      );
      return response;
    }

    return new Response(loginPage('비밀번호가 틀렸습니다.'), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 미인증 → 로그인 페이지
  return new Response(loginPage(), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});

function loginPage(error?: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin 로그인</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #F5F5F0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .box {
      background: #fff;
      border: 1px solid #e8e8e0;
      border-radius: 12px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 360px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
      color: #1A1A1A;
    }
    p { font-size: 0.85rem; color: #888; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 0.35rem; }
    input[type="password"] {
      width: 100%;
      padding: 0.65rem 0.9rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      margin-bottom: 1rem;
    }
    input[type="password"]:focus { border-color: #C0392B; }
    button {
      width: 100%;
      padding: 0.7rem;
      background: #C0392B;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #a93226; }
    .error {
      background: #fff5f5;
      border: 1px solid #f5c0b0;
      color: #c0392b;
      border-radius: 8px;
      padding: 0.6rem 0.9rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>🇰🇷 Admin</h1>
    <p>비밀번호를 입력하세요.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/admin/login">
      <label for="token">비밀번호</label>
      <input type="password" id="token" name="token" autofocus autocomplete="current-password" />
      <button type="submit">로그인</button>
    </form>
  </div>
</body>
</html>`;
}
