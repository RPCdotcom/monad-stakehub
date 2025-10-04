'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none';
  
  const variantStyles = {
    primary: 'button-primary',
    secondary: 'bg-secondary text-white hover:bg-opacity-90',
    outline: 'border border-border bg-transparent text-foreground hover:bg-background-secondary',
    ghost: 'bg-transparent text-foreground hover:bg-background-secondary'
  };
  
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 rounded-md',
    md: 'px-4 py-2 rounded-lg',
    lg: 'text-lg px-6 py-3 rounded-xl'
  };
  
  const loadingClass = isLoading ? 'opacity-80 cursor-wait' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${loadingClass}
        ${widthClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}