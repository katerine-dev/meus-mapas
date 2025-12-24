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
  primary: 'bg-purple-main hover:bg-purple-dark text-white',
  secondary: 'border border-purple-light text-purple-darkest hover:bg-purple-lightest',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  outlined: 'border-2 border-purple-light text-purple-main hover:bg-purple-light hover:text-white',
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
      className={`rounded-lg px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className} `}
    >
      {children}
    </button>
  );
}
