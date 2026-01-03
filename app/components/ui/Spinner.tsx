import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SpinnerProps {
  /** Tamanho do spinner: 'xs' (12px), 'sm' (16px), 'md' (32px - padrão), 'lg' (48px) */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Variante de cor: 'default' (roxo), 'white' (branco para fundos escuros) */
  variant?: 'default' | 'white';
  /** Texto opcional exibido ao lado do spinner */
  label?: string;
  /** Classes CSS adicionais */
  className?: string;
}

// Mapeamento de tamanhos para classes Tailwind
const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

// Mapeamento de variantes de cor
const variantClasses = {
  default: 'text-primary',
  white: 'text-white',
};

/**
 * Componente de loading spinner padrão da aplicação.
 * Utiliza o ícone ArrowPathIcon do Heroicons com animação de rotação.
 */
export default function Spinner({
  size = 'md',
  variant = 'default',
  label,
  className = '',
}: SpinnerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ArrowPathIcon className={`animate-spin ${variantClasses[variant]} ${sizeClasses[size]}`} />
      {label && (
        <span className={variant === 'white' ? 'text-white' : 'text-text-muted'}>{label}</span>
      )}
    </div>
  );
}
