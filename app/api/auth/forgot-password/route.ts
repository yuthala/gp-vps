import { NextResponse } from 'next/server';
import postgres from 'postgres';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/app/lib/email';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    // Проверяем только email, так как это этап ЗАПРОСА ссылки
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email обязателен для заполнения' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Ищем активного пользователя в базе данных
    const userResult = await sql`
      SELECT id FROM users 
      WHERE LOWER(email) = ${cleanEmail} AND date_deleted IS NULL
      LIMIT 1
    `;

    const user = userResult[0];

    // Безопасность: если email нет в базе, не даем хакерам понять это. Возвращаем ok: true.
    if (!user) {
      console.log(`Запрос сброса для несуществующего email: ${cleanEmail}`);
      return NextResponse.json({ ok: true });
    }

    // Генерируем безопасный токен и время жизни (1 час)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    // Записываем данные сброса в таблицу users
    await sql`
      UPDATE users
      SET reset_password_token = ${resetToken},
          reset_password_expires = ${tokenExpiry.toISOString()}
      WHERE id = ${user.id}
    `;

    // Формируем абсолютную ссылку для сброса пароля (уже в корневую папку /login)
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${base.replace(/\/$/, '')}/login/reset-password?token=${resetToken}`;

    // Отправляем письмо пользователю
    try {
      await sendPasswordResetEmail(cleanEmail, resetUrl);
    } catch (emailError) {
      console.error('Ошибка при отправке письма:', emailError);
      return NextResponse.json({ error: 'Не удалось отправить письмо восстановления. Попробуйте позже.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Ошибка в эндпоинте forgot-password:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
