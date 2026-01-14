/**
 * Login page
 *
 * Provides user login functionality with email and password.
 */

'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a]">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        {/* Logo/Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 mb-6 animate-scale-in">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#b2bac2] font-poppins">
            Welcome Back
          </h2>
          <p className="mt-3 text-base text-[#8b9ab0] font-medium">
            Log in to continue your productivity journey
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl shadow-lg p-8 sm:p-10">
          <AuthForm
            mode="login"
            onSubmit={login}
            error={error}
            isLoading={isLoading}
          />
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-[#8b9ab0]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-[#66b2ff] hover:text-[#b2bac2] transition-colors"
            >
              Sign up now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
