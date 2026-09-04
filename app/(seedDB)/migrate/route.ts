import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    console.log('=== СТАРТ СИСТЕМЫ МИГРАЦИЙ ===');

    // 1. Создаем служебную таблицу для учета миграций, если её еще нет
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    console.log('Служебная таблица _migrations проверена/создана.');

    // ─── МИГРАЦИЯ 1: Добавление полей для сброса пароля ───
    const migrationName = '2026_09_04_add_reset_password_fields';

    // Проверяем, запускалась ли эта миграция ранее
    const alreadyExecuted = await sql`
      SELECT id FROM _migrations WHERE name = ${migrationName} LIMIT 1
    `;

    if (alreadyExecuted.length > 0) {
      console.log(`Миграция "${migrationName}" уже была выполнена ранее. Пропуск.`);
      return NextResponse.json({
        ok: true,
        message: 'Все миграции находятся в актуальном состоянии. База данных обновлена.'
      });
    }

    console.log(`Запуск новой миграции: "${migrationName}"...`);

    // Запускаем атомарную транзакцию для наката структуры
    await sql.begin(async (transaction) => {
      // Добавляем колонку для токена
      await transaction`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_password_token TEXT
      `;

      // Добавляем колонку для времени жизни токена
      await transaction`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE
      `;

      // Фиксируем успех миграции в служебной таблице
      await transaction`
        INSERT INTO _migrations (name) VALUES (${migrationName})
      `;
    });

    console.log(`Миграция "${migrationName}" успешно зафиксирована в БД!`);
    console.log('=== КОНЕЦ СИСТЕМЫ МИГРАЦИЙ ===');

    return NextResponse.json({
      ok: true,
      message: `Миграция "${migrationName}" успешно применена. Служебная таблица обновлена.`
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Критическая ошибка при выполнении системы миграций:', error);
    return NextResponse.json({
      error: 'Ошибка при проведении миграций базы данных',
      details: error?.message || error
    }, { status: 500 });
  }
}

