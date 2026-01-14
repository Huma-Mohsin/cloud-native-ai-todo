/**
 * Login page
 *
 * Provides user login functionality with email and password.
 */

'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { OrbitingTasks } from '@/components/OrbitingTasks';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0a]">
      {/* Left Side - Branding & Animation */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* App Branding */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4">
              TaskFlow
            </h1>
            <p className="text-xl text-gray-400 font-medium">
              Organize. Prioritize. Achieve.
            </p>
          </div>

          {/* Orbiting Animation */}
          <div className="h-96 flex items-center justify-center">
            <OrbitingTasks />
          </div>

          {/* Features */}
          <div className="mt-12 space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-300">
              <span className="text-2xl">🎯</span>
              <span className="text-lg">Smart task management</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-300">
              <span className="text-2xl">📊</span>
              <span className="text-lg">Real-time analytics</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-300">
              <span className="text-2xl">⚡</span>
              <span className="text-lg">Lightning fast performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-base text-gray-400">
              Log in to continue your productivity journey
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl shadow-2xl p-8">
            <AuthForm
              mode="login"
              onSubmit={login}
              error={error}
              isLoading={isLoading}
            />
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign up now →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
