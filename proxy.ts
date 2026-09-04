import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
 
  // ПРОВЕРКА АВТОРИЗАЦИИ ПЕРЕД ПЕРЕХОДОМ НА /dashboard или /user-dashboard
  const { pathname } = req.nextUrl;
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

  // 1. Получаем токен NextAuth (если он есть)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-secret" });
  let userEmail = token?.email;

  // 2. Если токена NextAuth нет, проверяем постоянную сессию через ваш API
  if (!token) {
    try {
      const origin = req.nextUrl.origin;
      const validateRes = await fetch(`${origin}/api/session/validate`, { 
        headers: { cookie: req.headers.get('cookie') || '' } 
      });

      if (!validateRes.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Предполагаем, что ваш эндпоинт возвращает JSON с данными пользователя { email: "..." }
      const sessionData = await validateRes.json();
      userEmail = sessionData?.user?.email || sessionData?.email;

    } catch (e) {
      console.error("Session validation error:", e);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Если после всех проверок email определить не удалось — отправляем на логин
  if (!userEmail) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Проверка прав и перенаправление (Роутинг)
  const isAdmin = userEmail.toLowerCase() === adminEmail.toLowerCase();

  // Если обычный пользователь пытается зайти в админку /dashboard
  if (pathname.startsWith("/dashboard") && !isAdmin) {
    return NextResponse.redirect(new URL("/user-dashboard", req.url));
  }

  if (pathname.startsWith("/(seedDB)") && !isAdmin) {
    return NextResponse.redirect(new URL("/user-dashboard", req.url));
  }

  if (pathname.startsWith("/forbidden") && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Если админ пытается зайти на страницу обычного пользователя /user-dashboard
  if (pathname.startsWith("/user-dashboard") && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Перехватываем и админскую, и пользовательскую панели
export const config = {
  matcher: ["/dashboard/:path*", "/user-dashboard/:path*", '/forbidden/:path*','/(seeDB)/:path•'],
};
