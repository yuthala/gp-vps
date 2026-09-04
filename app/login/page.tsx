// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import LoginForm from "@/app/ui/login-form";

// export default function LoginPage() {
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
//   const [resendLoading, setResendLoading] = useState(false);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     const form = new FormData(e.currentTarget as HTMLFormElement);
//     const email = String(form.get("email") || "");
//     const password = String(form.get("password") || "");

//     try {
//       const resp = await fetch('/api/session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!resp.ok) {
//         const body = await resp.json().catch(() => ({}));
//         const errMsg = body?.error || 'Sign in failed';
//         setError(errMsg);
//         if (errMsg === 'Email not verified') {
//           setUnverifiedEmail(email);
//         }
//         setLoading(false);
//         return;
//       }

//       router.push('/dashboard');
//     } catch (e) {
//     console.log(e)
//       setError('Sign in error');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     const form = new FormData(e.currentTarget as HTMLFormElement);
//     const name = String(form.get('name') || '');
//     const email = String(form.get('email') || '');
//     const password = String(form.get('password') || '');
//     const confirmPassword = String(form.get('confirmPassword') || '');

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     try {
//       const resp = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password }),
//       });

//       if (!resp.ok) {
//         const body = await resp.json().catch(() => ({}));
//         setError(body?.error || 'Sign up failed');
//         setLoading(false);
//         return;
//       }

//       const body = await resp.json().catch(() => ({}));
//       // If verification is required, inform the user instead of auto-login
//       if (body?.verifyUrl) {
//         setInfo('Verification link sent — check your email (dev: link logged to server).');
//       } else {
//         // fallback: try to auto-login
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const res = await signIn('credentials', { redirect: false, email, password } as any);
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         if (res && (res as any).ok) router.push('/dashboard');
//         else setError('Sign up succeeded but auto-login failed');
//       }
//     } catch (e) {
//     console.log(e)
//       setError('Sign up error');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen justify-center p-6 pt-20 md:pt-30">
//       <div className="w-full max-w-md">
//         <LoginForm onSubmit={handleSubmit} onSignUp={handleSignUp} />
//         {error && (
//           <div className="pt-3">
//             <p className="text-sm text-red-600">{error}</p>
//             {unverifiedEmail && (
//               <button
//                 onClick={async () => {
//                   setResendLoading(true);
//                   try {
//                     const resp = await fetch('/api/auth/revalidate-email', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify({ email: unverifiedEmail }),
//                     });
//                     if (resp.ok) {
//                       setInfo('Verification email sent — check your inbox.');
//                       setUnverifiedEmail(null);
//                       setError(null);
//                     } else {
//                       const body = await resp.json().catch(() => ({}));
//                       setError(body?.error || 'Failed to send verification email');
//                     }
//                   } catch (e) {
//                     console.log(e)
//                     setError('Error sending verification email');
//                   } finally {
//                     setResendLoading(false);
//                   }
//                 }}
//                 disabled={resendLoading}
//                 className="pt-2 text-sm text-indigo-600 hover:text-indigo-500 underline disabled:opacity-50"
//               >
//                 {resendLoading ? 'Sending...' : 'Resend verification email'}
//               </button>
//             )}
//           </div>
//         )}
//         {info && (
//           <p className="pt-3 text-sm text-green-600">{info}</p>
//         )}
//         {loading && <p className="pt-3 text-sm text-gray-600">Processing…</p>}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import LoginForm from "@/app/ui/login-form";

// Импортируем изолированные сетевые функции
import { 
  loginUser, 
  signUpUser, 
  sendForgotPasswordLink, 
  resendVerificationEmail 
} from "@/app/lib/loginActions/loginActions";

export default function LoginPage() {
  const router = useRouter();
  
  // Общие состояния для уведомлений и ошибок
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Состояния для переключения в режим "Забыли пароль"
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // ЗАЩИТА ОТ БОТОВ: Скрытая ловушка Honeypot
  const [botTrap, setBotTrap] = useState(""); 

  // 1. ОБРАБОТЧИК: Вход в аккаунт (Login)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (botTrap) return setError("Доступ заблокирован: подозрительная активность");

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      await loginUser(email, password);
      router.push('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      if (err.message === 'Email not verified') {
        setUnverifiedEmail(email);
      }
    } finally {
      setLoading(false);
    }
  }

  // 2. ОБРАБОТЧИК: Регистрация нового пользователя (Sign Up)
  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (botTrap) return setError("Доступ заблокирован: подозрительная активность");

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const body = await signUpUser({ name, email, password });

      if (body?.verifyUrl) {
        setInfo('Verification link sent — check your email.');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await signIn('credentials', { redirect: false, email, password } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (res && (res as any).ok) router.push('/dashboard');
        else setError('Sign up succeeded but auto-login failed');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. ОБРАБОТЧИК: Запрос ссылки на восстановление пароля (Forgot Password)
  async function handleForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (botTrap) return;

    setForgotPasswordLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();

    try {
      // Отправляем запрос строго на /api/auth/forgot-password через утилиту
      await sendForgotPasswordLink(email);
      setInfo('Ссылка для восстановления пароля отправлена на ваш Email.');
      setIsForgotPasswordMode(false); // Возвращаем пользователя к экрану входа
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } file: {
      setForgotPasswordLoading(false);
    }
  }

  // 4. ОБРАБОТЧИК: Повторная отправка письма подтверждения email
  async function handleResendEmail() {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setInfo('Verification email sent — check your inbox.');
      setUnverifiedEmail(null);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-start p-6 pt-20 md:pt-30">
      <div className="w-full max-w-md flex flex-col justify-center">
        
        {/* СКРЫТОЕ ПОЛЕ ДЛЯ ЗАЩИТЫ ОТ БОТОВ (HONEYPOT) */}
        <div className="opacity-0 absolute -z-10 pointer-events-none" aria-hidden="true">
          <input
            type="text"
            name="middle_name"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* УСЛОВНЫЙ РЕНДЕРИНГ ЭКРАНОВ */}
        {isForgotPasswordMode ? (
          /* ─── ЭКРАН 1: ВОССТАНОВЛЕНИЕ ПАРОЛЯ ─── */
          <div className="rounded-lg bg-white p-6 shadow-md border border-gray-100 text-base">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Восстановление пароля</h2>
            <p className="text-base text-gray-500 mb-4">Введите ваш E-mail, и мы отправим ссылку для сброса пароля.</p>
            
            {/* Эта форма вызывает строго предназначенный метод handleForgotPasswordSubmit */}
            <form onSubmit={handleForgotPasswordSubmit} className="grid gap-4">
              <label className="grid gap-1 text-base font-medium">
                E-mail
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-green-500" 
                  placeholder="email@domain.com"
                />
              </label>
              
              <button 
                type="submit" 
                disabled={forgotPasswordLoading}
                className="w-full rounded-md bg-green-600 py-2 text-base font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
              >
                {forgotPasswordLoading ? 'Отправка...' : 'Сбросить пароль'}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setError(null);
                  setInfo(null);
                  setIsForgotPasswordMode(false);
                }}
                className="text-base text-gray-500 hover:text-gray-700 text-center underline mt-1"
              >
                Вернуться к авторизации
              </button>
            </form>
          </div>
        ) : (
          /* ─── ЭКРАН 2: ВХОД И РЕГИСТРАЦИЯ (ОСНОВНОЙ) ─── */
          <div className="relative">
            <LoginForm 
							onSubmit={handleSubmit} 
							onSignUp={handleSignUp}
							onForgotPassword={() => {
								setError(null);
								setInfo(null);
								setIsForgotPasswordMode(true);
							}}
						/>
          </div>
        )}

        {/* ВЫВОД ОШИБОК И ИНФОРМАЦИИ */}
        {error && (
          <div className="pt-3 px-1">
            <p className="text-sm text-red-600">{error}</p>
            {unverifiedEmail && (
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="pt-2 text-sm text-indigo-600 hover:text-indigo-500 underline disabled:opacity-50 block"
              >
                {resendLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        {info && <p className="pt-3 px-1 text-sm text-green-600">{info}</p>}
        {loading && !isForgotPasswordMode && <p className="pt-3 px-1 text-sm text-gray-600">Processing…</p>}
      </div>
    </div>
  );
}
