'use client';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  disabled,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`focus:ring-focus-ring/30 w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2 ${className} `}
    />
  );
}
