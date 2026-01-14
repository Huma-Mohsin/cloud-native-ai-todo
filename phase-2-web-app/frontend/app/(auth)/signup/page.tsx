/**
 * Signup page
 *
 * Provides user registration functionality with name, email, and password.
 */

'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/AuthForm';
import { OrbitingTasks } from '@/components/OrbitingTasks';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const { signup, isLoading, error } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0a]">
      {/* Left Side - Branding & Animation */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* App Branding */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 mb-6">
              <span className="text-4xl">🚀</span>
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
          <div className="mt-12 text-center lg:text-left">
            <p className="text-base text-gray-400 font-medium">
              Smart task management <span className="text-gray-600 mx-2">|</span> Real-time analytics <span className="text-gray-600 mx-2">|</span> Lightning fast performance
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        {/* Background decorative elements for right side */}
        <div className="absolute top-40 right-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md space-y-8 animate-slide-up relative z-10">
          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-white mb-2">
              Get Started
            </h2>
            <p className="text-base text-gray-400">
              Create your account and start managing tasks
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl shadow-2xl p-8">
            <AuthForm
              mode="signup"
              onSubmit={signup}
              error={error}
              isLoading={isLoading}
            />
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Log in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
