'use client';

import { KeyboardEvent } from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export default function Input({
  value,
  onChange,
  placeholder,
  className = '',
  disabled,
  onKeyDown,
}: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onKeyDown={onKeyDown}
      className={`focus:ring-focus-ring/30 w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2 ${className} `}
    />
  );
}
