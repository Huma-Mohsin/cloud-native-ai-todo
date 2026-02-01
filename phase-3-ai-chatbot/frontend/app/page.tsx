'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn.email({
          email,
          password,
        });
      } else {
        await signUp.email({
          email,
          password,
          name,
        });
      }
      router.push('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/chat',
      });
    } catch (err) {
      setError('Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-metallic-gradient">
      <div className="bg-white p-8 rounded-2xl shadow-blue w-full max-w-md border-2 border-metallic-sky">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-gradient rounded-2xl mb-4 shadow-metallic">
            <h1 className="text-4xl font-bold text-white">
              ✨ TaskFlow AI
            </h1>
          </div>
          <p className="text-metallic-navy text-lg">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-metallic-navy-light mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-metallic-sky rounded-xl focus:ring-2 focus:ring-metallic-blue-light focus:border-transparent transition-all duration-200 bg-metallic-sky-light/30"
                required={!isLogin}
                disabled={loading}
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-metallic-navy-light mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-metallic-sky rounded-xl focus:ring-2 focus:ring-metallic-blue-light focus:border-transparent transition-all duration-200 bg-metallic-sky-light/30"
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-metallic-navy-light mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-metallic-sky rounded-xl focus:ring-2 focus:ring-metallic-blue-light focus:border-transparent transition-all duration-200 bg-metallic-sky-light/30"
              required
              disabled={loading}
              minLength={8}
              placeholder="Enter your password (min 8 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-gradient text-white py-3 rounded-xl hover:shadow-blue disabled:bg-metallic-sky disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-metallic hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <svg className="animate-spin inline h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </>
            ) : isLogin ? '🚀 Sign In' : '✨ Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-metallic-sky"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-metallic-blue font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white border-2 border-metallic-sky text-metallic-navy py-3 rounded-xl hover:bg-metallic-sky-light/40 disabled:bg-metallic-sky-light disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-metallic hover:shadow-blue"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-metallic-blue-light hover:text-metallic-blue-dark text-sm font-semibold hover:underline transition-colors duration-200"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
