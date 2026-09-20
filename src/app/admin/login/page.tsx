'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('reddphotographycreations@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {});
  }, [router, redirectPath]);

  const doLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      // Hard redirect to ensure browser carries newly assigned session cookie
      window.location.href = redirectPath;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const handleQuickLogin = async () => {
    setEmail('reddphotographycreations@gmail.com');
    setPassword('ReddAdmin2024!#');
    await doLogin('reddphotographycreations@gmail.com', 'ReddAdmin2024!#');
  };

  return (
    <div className="bg-[#0e0e13] border border-white/10 rounded-sm p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 mb-2">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-white tracking-tight">
          REDD Studio CMS
        </h1>
        <p className="text-neutral-400 text-xs tracking-wider uppercase">
          Restricted Administrator Access
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded flex items-center space-x-3 text-red-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
            Administrator User ID / Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reddphotographycreations@gmail.com"
              className="w-full bg-[#13131a] border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
            />
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
              Master Password
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
              className="w-full bg-[#13131a] border border-white/10 pl-10 pr-12 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors"
            />
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-neutral-500 hover:text-neutral-300 absolute right-3.5 top-3 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick credentials helper banner */}
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded text-[11px] text-neutral-400 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-neutral-300 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Authorized Account</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Admin</span>
          </div>
          <p className="font-mono text-white text-[11px]">reddphotographycreations@gmail.com</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-neutral-500">
              Pass: <code className="text-red-400 bg-red-950/40 px-1 py-0.5 rounded font-mono">ReddAdmin2024!#</code>
            </span>
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              Quick Sign In
            </button>
          </div>
        </div>

        {/* Sign in Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-[0.25em] font-semibold transition-colors disabled:opacity-50 mt-2 cursor-pointer flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In To CMS</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#060608] text-neutral-200 flex flex-col justify-between p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full pt-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gallery</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-neutral-500">
          <Lock className="w-3.5 h-3.5 text-red-500" />
          <span>Secure Admin Portal</span>
        </div>
      </div>

      {/* Login Card inside Suspense */}
      <div className="max-w-md w-full mx-auto my-auto py-12">
        <Suspense
          fallback={
            <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              <span>Loading portal...</span>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] uppercase tracking-widest text-neutral-600 pb-4">
        <span>REDD Photography Creations • Administrative Subsystem</span>
      </div>
    </div>
  );
}
