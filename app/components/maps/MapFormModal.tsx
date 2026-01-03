'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import TextArea from '@/app/components/ui/TextArea';
import ErrorMessage from '@/app/components/ui/ErrorMessage';
import { validateMapData } from '@/app/validation/map';
import { MapSchema } from '@/app/validation/map';
import type { ValidationError } from '@/app/validation/types';

type MapFormMode = 'create' | 'edit';

interface MapFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<{ error?: string } | void>;
  mode: MapFormMode;
  /** Valores iniciais para edição (opcional para criação) */
  initialName?: string;
  initialDescription?: string;
}

/**
 * Modal unificado para criar e editar mapas.
 */
export default function MapFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialName = '',
  initialDescription = '',
}: MapFormModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCreateMode = mode === 'create';
  const title = isCreateMode ? 'Criar Novo Mapa' : 'Editar Mapa';
  const submitLabel = isCreateMode ? 'Criar' : 'Editar';
  const loadingLabel = isCreateMode ? 'Criando...' : 'Salvando...';
  const errorMessage = isCreateMode
    ? 'Erro ao criar mapa. Tente novamente.'
    : 'Erro ao editar mapa. Tente novamente.';

  // Reseta o formulário quando o modal abre ou os valores iniciais mudam
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setErrors([]);
      setApiError(null);
      setLoading(false);
    }
  }, [isOpen, initialName, initialDescription]);

  // Função executada ao submeter o formulário
  const handleSubmit = async () => {
    // Executa a validação dos dados inseridos pelo usuário
    const validationErrors = validateMapData(name, description);
    // Se houver erros, atualiza o estado de erros e interrompe o submit
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setApiError(null);
      return;
    }

    // Se passou na validação, limpa os erros e prossegue com o submit
    setErrors([]);
    setApiError(null);
    setLoading(true);

    try {
      // Envia o nome já com trim aplicado para remover espaços em branco
      const result = await onSubmit(name.trim(), description);

      if (result?.error) {
        setApiError(result.error);
        setLoading(false);
        return;
      }

      onClose();
    } catch {
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para buscar a mensagem de erro de um campo específico
  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="map-form-modal-title">
      <div className="flex flex-col gap-4">
        {/* Título */}
        <div className="flex justify-center">
          <h1 id="map-form-modal-title" className="text-2xl font-semibold text-primary">
            {title}
          </h1>
        </div>

        {/* Erro da API */}
        <ErrorMessage message={apiError} />

        <div>
          <Input placeholder="NOME*" value={name} onChange={setName} />
          {/* Exibe a mensagem de erro abaixo do input se houver erro no campo 'name' */}
          <ErrorMessage message={getError('name') ?? null} />
        </div>

        <div>
          <TextArea
            placeholder="DESCRIÇÃO"
            value={description}
            onChange={setDescription}
            rows={3}
          />
          {/* Exibe a mensagem de erro abaixo do textarea se houver erro no campo 'description' */}
          <ErrorMessage message={getError('description') ?? null} />
        </div>

        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={!MapSchema.safeParse({ name }).success || loading}
        >
          {loading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </Modal>
  );
}
