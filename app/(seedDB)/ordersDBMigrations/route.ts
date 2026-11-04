'use server'
import { redirect } from 'next/navigation';
import postgres from 'postgres';


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

  async function getAuthorizedUser(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/session_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) return null;

  const now = new Date().toISOString();
  const rows = await sql`
    SELECT u.id, u.role, u.email
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
    AND s.expires > ${now}
    LIMIT 1
  `;
  return rows[0] || null;
}

// MIGRATION: Добавлено в таблицу orders поле order_number
async function addOrderNumberToDatabase() {
    // 1. Создаем последовательность, которая стартует с 100001
    await sql`
        CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 100001;
    `;

    // 2. Добавляем колонку order_number в таблицу orders. 
    // Она автоматически будет брать следующее значение из последовательности.
    await sql`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS order_number INT 
        DEFAULT nextval('order_number_seq') NOT NULL UNIQUE;
    `;

    console.log('Генерация номеров заказов успешно настроена.');
}


  export async function GET(req: Request) {
    try {
      const user = await getAuthorizedUser(req);
      if (!user || user.email !== adminEmail) {
        redirect('/forbidden'); // Вызывает внутреннее исключение Next.js
      }
  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await sql.begin(() => [ // убрал аргумент sql из функции sql.begin(sql) 
       addOrderNumberToDatabase()
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