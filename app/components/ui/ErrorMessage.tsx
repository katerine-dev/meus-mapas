'use client';

interface ErrorMessageProps {
  /** Mensagem de erro a ser exibida */
  message: string | null;
}

/**
 * Componente para exibir mensagens de erro da API.
 * Renderiza null se a mensagem for null ou vazia.
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-destructive-border bg-destructive-light p-3 text-sm text-destructive">
      {message}
    </div>
  );
}
