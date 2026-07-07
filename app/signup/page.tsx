'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is off, session exists immediately
    if (data.session) {
      router.push('/onboarding');
      router.refresh();
    } else {
      setSent(true);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-soft)' }}>
        <div className="w-full max-w-sm text-center rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--line)' }}>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Check your email</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>We sent a confirmation link to <b>{email}</b>. Click it to activate your account and start building.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-soft)' }}>
      <div className="w-full max-w-sm">
        <a href="/" className="serif text-3xl block text-center mb-8" style={{ color: 'var(--ink)' }}>Slingshot</a>

        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--line)' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Start your free trial</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>14 days free · no credit card required.</p>

          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold mb-4"
            style={{ border: '1px solid var(--line)', background: 'white', color: 'var(--ink)', opacity: googleLoading ? 0.6 : 1 }}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-3">
            <input
              type="email" required placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid var(--line)' }}
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid var(--line)' }}
            />
            {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-bold"
              style={{ background: 'var(--ink)', color: 'white', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--muted)' }}>
            Already have an account? <a href="/login" className="font-semibold" style={{ color: 'var(--ink)' }}>Log in</a>
          </p>
        </div>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--muted)' }}>
          By continuing you agree to Slingshot's Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36.3 24 36.3c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.9 39.7 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.4C40.9 36.6 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
