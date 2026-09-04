import { NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    // Вот эта проверка срабатывала у вас на странице входа, так как запрос шел не туда
    if (!token || !password) {
      return NextResponse.json({ error: 'Токен и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен быть не менее 6 символов' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    // Ищем пользователя по токену и проверяем время жизни
    const userResult = await sql`
      SELECT id 
      FROM users 
      WHERE reset_password_token = ${token}
        AND reset_password_expires > ${nowIso}
        AND date_deleted IS NULL
      LIMIT 1
    `;

    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ 
        error: 'Ссылка для сброса пароля недействительна или её срок действия истек (1 час).' 
      }, { status: 400 });
    }

    // Хэшируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновляем хэш пароля и зануляем токены сброса
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword},
          reset_password_token = NULL,
          reset_password_expires = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ ok: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Ошибка на эндпоинте reset-password:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при сбросе пароля' }, { status: 500 });
  }
}

