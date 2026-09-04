// app/lib/actions/authActions.ts

/**
 * Авторизация пользователя (Вход)
 */
export async function loginUser(email: string, password: string) {
  const resp = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || 'Sign in failed');
  }

  return await resp.json().catch(() => ({}));
}

/**
 * Регистрация нового пользователя
 */
export async function signUpUser(data: Record<string, string>) {
  const resp = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || 'Sign up failed');
  }

  return await resp.json().catch(() => ({}));
}

/**
 * Отправка ссылки для восстановления пароля
 */
export async function sendForgotPasswordLink(email: string) {
  const resp = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || 'Не удалось отправить запрос. Проверьте Email.');
  }

  return true;
}

/**
 * Повторная отправка письма верификации
 */
export async function resendVerificationEmail(email: string) {
  const resp = await fetch('/api/auth/revalidate-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || 'Failed to send verification email');
  }

  return true;
}
