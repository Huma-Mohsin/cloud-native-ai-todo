/**
 * Authentication client configuration.
 *
 * This module provides a simplified auth client since we're using
 * custom JWT implementation instead of Better Auth library.
 * It wraps the API client for authentication operations.
 */

import { fetchAPI, setAuthToken, removeAuthToken } from './api';
import type { SignupRequest, LoginRequest, TokenResponse } from './types';

/**
 * Auth client for signup, login, and logout operations
 */
export const authClient = {
  /**
   * Register a new user account
   *
   * @param data - Signup data (name, email, password)
   * @returns Token response with user data
   */
  async signup(data: SignupRequest): Promise<TokenResponse> {
    const response = await fetchAPI<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // Don't include auth header for signup

    // Store token
    setAuthToken(response.access_token);

    return response;
  },

  /**
   * Login to existing account
   *
   * @param data - Login credentials (email, password)
   * @returns Token response with user data
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await fetchAPI<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // Don't include auth header for login

    // Store token
    setAuthToken(response.access_token);

    return response;
  },

  /**
   * Logout current user
   *
   * Removes the JWT token from storage and calls logout endpoint.
   */
  async logout(): Promise<void> {
    try {
      await fetchAPI('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore errors during logout
      console.error('Logout error:', error);
    } finally {
      // Always remove token from storage
      removeAuthToken();
    }
  },
};
