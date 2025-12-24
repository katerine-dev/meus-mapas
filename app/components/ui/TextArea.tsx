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
      className={`border-purple-light text-purple-darkest placeholder:text-purple-light focus:border-purple-main w-full resize-none rounded-lg border px-4 py-3 focus:outline-none ${className} `}
    />
  );
}
