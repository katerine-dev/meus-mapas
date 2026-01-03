'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

/**
 * Componente reutilizável para exibir estados de erro
 * Pode ser usado em páginas, listas ou seções que falharam ao carregar
 * Segue o padrão de cores roxo da aplicação
 */
export default function ErrorState({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado.',
  onRetry,
  retryLabel = 'Tentar novamente',
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-hover p-4">
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-purple-main" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">{title}</p>
          {message && <p className="mt-0.5 text-xs text-text-muted">{message}</p>}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 text-sm font-medium text-primary underline hover:no-underline"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <ExclamationTriangleIcon className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {message && <p className="mt-1 text-sm text-text-muted">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
