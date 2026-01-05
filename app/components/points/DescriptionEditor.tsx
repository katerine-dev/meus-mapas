'use client';

import { NO_DESCRIPTION_PLACEHOLDER } from '@/app/constants/messages';
import { PencilIcon } from '@heroicons/react/24/outline';
import { MAP_VALIDATION } from '@/app/validation/map';

interface DescriptionEditorProps {
  description: string;
  isEditing: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  /** Variante de estilo: desktop tem bordas arredondadas maiores */
  variant?: 'desktop' | 'mobile';
}

/**
 * Componente reutilizável para edição de descrição do mapa.
 * Usado tanto no painel desktop quanto no drawer mobile.
 */
export default function DescriptionEditor({
  description,
  isEditing,
  value,
  onValueChange,
  onEdit,
  onCancel,
  onSave,
  variant = 'desktop',
}: DescriptionEditorProps) {
  const isDesktop = variant === 'desktop';

  // Classes do textarea variam por variante
  const textareaClass = isDesktop
    ? 'focus:ring-focus-ring/30 w-full rounded-xl border border-border p-2.5 text-sm text-text-primary placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2'
    : 'w-full rounded-lg border border-border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  // Classes do botão cancelar variam por variante
  const cancelBtnClass = isDesktop
    ? 'btn-interactive rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover'
    : 'rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover';

  // Classes do botão salvar (iguais nas duas variantes)
  const saveBtnClass =
    'rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover';

  if (!isEditing) {
    return (
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 break-words text-sm text-text-muted">
          {description || NO_DESCRIPTION_PLACEHOLDER}
        </p>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-hover hover:text-primary"
          aria-label="Editar descrição"
          title="Editar descrição"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={textareaClass}
        rows={2}
        maxLength={MAP_VALIDATION.DESCRIPTION_MAX_LENGTH}
        placeholder="Adicione uma descrição..."
      />
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onCancel} className={cancelBtnClass}>
          Cancelar
        </button>
        <button onClick={onSave} className={saveBtnClass}>
          Salvar
        </button>
      </div>
    </div>
  );
}
