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
      className={`border-purple-light text-purple-darkest placeholder:text-purple-light focus:border-purple-main w-full rounded-lg border px-4 py-3 focus:outline-none ${className} `}
    />
  );
}
