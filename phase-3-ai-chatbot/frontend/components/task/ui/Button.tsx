/**
 * Button component - Reusable button with Metallic Chic theme
 *
 * Features:
 * - Multiple variants (default, outline, ghost, destructive, gold)
 * - Loading state with spinner
 * - Disabled state
 * - Metallic Chic color scheme
 */

'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-metallic-sky text-metallic-navy-dark hover:bg-metallic-sky-dark shadow-metallic hover:shadow-blue transition-all duration-200',
      outline: 'border-2 border-metallic-sky bg-transparent text-metallic-navy hover:border-metallic-blue hover:bg-metallic-blue/10 hover:text-metallic-blue transition-all duration-200',
      ghost: 'hover:bg-metallic-sky/20 text-metallic-navy hover:text-metallic-blue transition-all duration-200',
      destructive: 'bg-error text-white hover:bg-red-700 transition-all duration-200',
      gold: 'bg-gold-gradient text-metallic-navy-dark hover:shadow-blue shadow-lg hover:scale-105 transition-all duration-200 font-semibold',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-md',
      md: 'h-10 px-4 py-2 rounded-lg',
      lg: 'h-11 px-8 rounded-lg text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-metallic-blue focus:ring-offset-2 focus:ring-offset-metallic-navy disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
