/**
 * API client utility for making authenticated requests to the backend.
 *
 * This module provides a wrapper around the fetch API that automatically
 * handles authentication headers and error responses.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API error response type
 */
export interface ApiError {
  detail: string;
  status: number;
}

/**
 * Generic API client for making HTTP requests with automatic auth header injection
 *
 * @param endpoint - API endpoint path (e.g., '/auth/login')
 * @param options - Fetch options (method, body, headers, etc.)
 * @param includeAuth - Whether to include the Authorization header (default: true)
 * @returns Parsed JSON response
 * @throws ApiError if the request fails
 *
 * @example
 * ```typescript
 * const user = await fetchAPI('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email, password }),
 * });
 * ```
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if requested
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token added to request:', endpoint);
    } else {
      console.warn('⚠️ No token found for authenticated request:', endpoint);
    }
  }

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle error responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText || 'Unknown error',
    }));

    throw {
      detail: error.detail || error.message || 'Request failed',
      status: response.status,
    } as ApiError;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse and return JSON
  return response.json();
}

/**
 * Get authentication token from cookies
 *
 * @returns JWT token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Read from cookie
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));

  if (authCookie) {
    return authCookie.split('=')[1];
  }

  // Migration: Check localStorage for old token and migrate to cookie
  const oldToken = localStorage.getItem('auth_token');
  if (oldToken) {
    console.log('Migrating token from localStorage to cookies...');
    setAuthToken(oldToken);
    localStorage.removeItem('auth_token');
    return oldToken;
  }

  return null;
}

/**
 * Set authentication token in cookies
 *
 * @param token - JWT token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;

  // Set cookie with 7 days expiry
  const expiryDays = 7;
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));

  document.cookie = `auth_token=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  console.log('✅ Token saved to cookies');
}

/**
 * Remove authentication token from cookies
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;

  // Remove cookie by setting expiry to past date
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}

/**
 * Check if user is authenticated (has valid token)
 *
 * @returns True if token exists, false otherwise
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
