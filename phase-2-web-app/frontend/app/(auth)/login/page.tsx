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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 animate-slide-up">
        {/* Logo/Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 shadow-2xl shadow-purple-500/50 mb-6 animate-scale-in">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold gradient-text font-poppins">
            Welcome Back
          </h2>
          <p className="mt-3 text-base text-gray-600 font-medium">
            Log in to continue your productivity journey
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="card p-8 sm:p-10">
          <AuthForm
            mode="login"
            onSubmit={login}
            error={error}
            isLoading={isLoading}
          />
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Sign up now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
