/**
 * useAuth hook for authentication state management.
 *
 * This hook provides authentication functionality including login, signup,
 * logout, and user state management using React hooks.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';
import { getAuthToken, isAuthenticated } from '@/lib/api';
import type { User, SignupRequest, LoginRequest } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signup: (data: SignupRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Authentication hook for managing user auth state
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```typescript
 * const { user, login, logout, isLoading, error } = useAuth();
 *
 * const handleLogin = async (email, password) => {
 *   await login({ email, password });
 * };
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();

      if (!token) {
        setState({
          user: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // If we have a token, decode it to get user info
      // For simplicity, we'll assume the user is authenticated
      // In a real app, you might want to verify the token with the server
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setState({
          user: {
            id: parseInt(payload.sub),
            email: payload.email,
            name: '', // We don't store name in JWT, would need to fetch from API
            created_at: '',
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
        setState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  /**
   * Sign up a new user
   */
  const signup = useCallback(async (data: SignupRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authClient.signup(data);

      setState({
        user: response.user,
        isLoading: false,
        error: null,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.detail || 'Signup failed',
      }));
      throw error;
    }
  }, [router]);

  /**
   * Log in an existing user
   */
  const login = useCallback(async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authClient.login(data);

      setState({
        user: response.user,
        isLoading: false,
        error: null,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.detail || 'Login failed',
      }));
      throw error;
    }
  }, [router]);

  /**
   * Log out the current user
   */
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authClient.logout();

      setState({
        user: null,
        isLoading: false,
        error: null,
      });

      // Redirect to login
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  return {
    ...state,
    signup,
    login,
    logout,
    isAuthenticated: state.user !== null,
  };
}
