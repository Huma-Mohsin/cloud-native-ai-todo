/**
 * AuthForm component - Reusable form for login and signup
 *
 * Features:
 * - Handles both login and signup modes
 * - Client-side validation
 * - Loading states
 * - Error display
 */

'use client';

import React, { useState, FormEvent } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import type { SignupRequest, LoginRequest } from '@/lib/types';

interface SignupFormProps {
  mode: 'signup';
  onSubmit: (data: SignupRequest) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

interface LoginFormProps {
  mode: 'login';
  onSubmit: (data: LoginRequest) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

type AuthFormProps = SignupFormProps | LoginFormProps;

export function AuthForm({ mode, onSubmit, error, isLoading = false }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (mode === 'signup') {
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/\d/.test(formData.password)) {
        errors.password = 'Password must contain at least one digit';
      }
    }

    // Name validation (signup only)
    if (mode === 'signup') {
      if (!formData.name) {
        errors.name = 'Name is required';
      } else if (formData.name.length < 1 || formData.name.length > 100) {
        errors.name = 'Name must be 1-100 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === 'signup') {
      const submitData: SignupRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      await onSubmit(submitData);
    } else {
      const submitData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };
      await onSubmit(submitData);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {mode === 'signup' && (
        <Input
          label="Name"
          type="text"
          placeholder="Ahmed Khan"
          value={formData.name}
          onChange={handleChange('name')}
          error={validationErrors.name}
          disabled={isLoading}
          required
        />
      )}

      <Input
        label="Email"
        type="email"
        placeholder="ahmed@example.com"
        value={formData.email}
        onChange={handleChange('email')}
        error={validationErrors.email}
        disabled={isLoading}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder={mode === 'signup' ? 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit' : '••••••••'}
        value={formData.password}
        onChange={handleChange('password')}
        error={validationErrors.password}
        helperText={mode === 'signup' ? 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit' : undefined}
        disabled={isLoading}
        required
      />

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-400 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="md"
        isLoading={isLoading}
        className="w-full"
      >
        {mode === 'signup' ? 'Sign Up' : 'Log In'}
      </Button>
    </form>
  );
}
