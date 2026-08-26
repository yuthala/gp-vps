'use server'
import postgres from 'postgres';
import { redirect } from 'next/navigation';


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });


// Получение почты администратора из .env
let adminEmail: string;
  // Безопасное получение переменной окружения через try/catch
  try {
    const envEmail = process.env.ADMIN_EMAIL;
    
    // Если переменная не задана или является пустой строкой
    if (!envEmail || envEmail.trim() === "") {
      throw new Error("Переменная окружения ADMIN_EMAIL не настроена в .env файле.");
    }
    
    adminEmail = envEmail;
  } catch (error) {
    // Логируем ошибку конфигурации на сервере
    console.error("[Config Error]:", error);
    
    // Так как админский email не настроен, во избежание уязвимостей 
    // присваиваем значение, которое гарантированно не совпадет ни с одним пользователем
    adminEmail = "DISABLED_NO_ADMIN_CONFIGURED";
  }

  //ПОЛУЧЕНИЕ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ
//   async function getAuthorizedUser(req: Request) {
//   const cookie = req.headers.get('cookie') || '';
//   const match = cookie.match(/session_token=([^;]+)/);
//   const token = match ? match[1] : null;
//   if (!token) return null;

//   const now = new Date().toISOString();
//   const rows = await sql`
//     SELECT u.id, u.name, u.email
//     FROM sessions s
//     JOIN users u ON u.id = s.user_id
//     WHERE s.session_token = ${token}
//     AND s.expires > ${now}
//     LIMIT 1
//   `;
//   return rows[0] || null;
// }
// Описываем структуру объекта, который возвращает база данных
interface AuthorizedUser {
  id: string;
  role: 'admin' | 'stuff' | 'customer';
  email: string;
}

async function getAuthorizedUser(req: Request): Promise<AuthorizedUser | null> {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/session_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  // Для работы с TIMESTAMP WITH TIME ZONE лучше передавать объект Date напрямую, 
  // драйвер postgres сам преобразует его в нужный формат.
  const now = new Date();

  const rows = await sql<AuthorizedUser[]>`
    SELECT u.id, u.role, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
    AND s.expires > ${now}
    LIMIT 1
  `;

  return rows[0] || null;
}


/**
 * Инициализация или принудительное обновление структуры таблицы users под требования UserEntity
 */
export async function syncUsersTableStructure(): Promise<void> {
  // Гарантируем наличие расширения для UUID
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  // Гарантируем наличие перечисления ENUM в схеме базы данных
  await sql`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'stuff', 'customer');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `;

  // Создаем или проверяем актуальность таблицы users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      role user_role NOT NULL DEFAULT 'customer',
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      email_verification_token TEXT,
      email_verified_at TIMESTAMP WITH TIME ZONE,
      registration_ip INET,
      registration_device TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `;

  // Накатываем изменения деструктивно, если таблица существовала в старом формате
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS name;`;
  
  await sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'customer',
    ADD COLUMN IF NOT EXISTS registration_ip INET,
    ADD COLUMN IF NOT EXISTS registration_device TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;
  `;

  console.log("🚀 [БД]: Таблица users успешно синхронизирована с интерфейсом UserEntity.");
}


// export async function GET(req: Request) {

//   try {
//      const user = await getAuthorizedUser(req);
//     if (!user || user.email  !== adminEmail) {
//       //return forbiddenPage();
//       redirect('/forbidden');
//     }
    
//     const result = await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
//      syncUsersTableStructure()
//     ]);

//     return Response.json({ message: 'Database seeded successfully', result });
//   } catch (error) {
//     console.error('Seed route error', error);
//     return Response.json({ error: 'Server error' }, { status: 500 });
//   }
// }

//import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  try {
    const user = await getAuthorizedUser(req);
    if (!user || user.email !== adminEmail) {
      redirect('/forbidden'); // Вызывает внутреннее исключение Next.js
    }

    const result = await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
     syncUsersTableStructure()
    ]);

    return Response.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // ВАЖНО: Проверяем, является ли ошибка системным редиректом Next.js
    if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Пробрасываем её дальше, чтобы Next.js выполнил переход
    }

    // Обработка всех остальных реальных ошибок сидинга
    console.error("Seed route error", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

