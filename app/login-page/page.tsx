"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import LoginForm from "@/app/ui/login-form";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const resp = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const errMsg = body?.error || 'Sign in failed';
        setError(errMsg);
        if (errMsg === 'Email not verified') {
          setUnverifiedEmail(email);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (e) {
    console.log(e)
      setError('Sign in error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        setError(body?.error || 'Sign up failed');
        setLoading(false);
        return;
      }

      const body = await resp.json().catch(() => ({}));
      // If verification is required, inform the user instead of auto-login
      if (body?.verifyUrl) {
        setInfo('Verification link sent — check your email (dev: link logged to server).');
      } else {
        // fallback: try to auto-login
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await signIn('credentials', { redirect: false, email, password } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (res && (res as any).ok) router.push('/dashboard');
        else setError('Sign up succeeded but auto-login failed');
      }
    } catch (e) {
    console.log(e)
      setError('Sign up error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm onSubmit={handleSubmit} onSignUp={handleSignUp} />
        {error && (
          <div className="mt-3">
            <p className="text-sm text-red-600">{error}</p>
            {unverifiedEmail && (
              <button
                onClick={async () => {
                  setResendLoading(true);
                  try {
                    const resp = await fetch('/api/auth/revalidate-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: unverifiedEmail }),
                    });
                    if (resp.ok) {
                      setInfo('Verification email sent — check your inbox.');
                      setUnverifiedEmail(null);
                      setError(null);
                    } else {
                      const body = await resp.json().catch(() => ({}));
                      setError(body?.error || 'Failed to send verification email');
                    }
                  } catch (e) {
                    console.log(e)
                    setError('Error sending verification email');
                  } finally {
                    setResendLoading(false);
                  }
                }}
                disabled={resendLoading}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}
        {info && (
          <p className="mt-3 text-sm text-green-600">{info}</p>
        )}
        {loading && <p className="mt-3 text-sm text-gray-600">Processing…</p>}
      </div>
    </main>
  );
}
