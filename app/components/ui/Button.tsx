'use client';

import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outlined';

interface ButtonProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white focus:ring-2 focus:ring-focus-ring focus:ring-offset-2',
  secondary:
    'border border-border text-text-primary hover:bg-surface-hover focus:ring-2 focus:ring-focus-ring',
  danger:
    'bg-destructive hover:bg-destructive-hover text-white focus:ring-2 focus:ring-destructive',
  outlined:
    'border-2 border-primary text-primary hover:bg-primary-light focus:ring-2 focus:ring-focus-ring',
};

export default function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-interactive cursor-pointer rounded-lg px-4 py-3 font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className} `}
    >
      {children}
    </button>
  );
}
