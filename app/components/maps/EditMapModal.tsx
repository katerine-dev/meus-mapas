'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import { validateMapData } from '@/app/validation/map';
import type { ValidationError } from '@/app/validation/types';

interface EditMapModalInnerProps {
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<{ error?: string } | void>;
  initialName: string;
  initialDescription: string;
}

function EditMapModalInner({
  onClose,
  onSubmit,
  initialName,
  initialDescription,
}: EditMapModalInnerProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setApiError('Erro ao editar mapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para buscar a mensagem de erro de um campo específico
  const getError = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <h1 className="text-2xl font-semibold text-purple-main">Editar Mapa</h1>
        </div>

        {/* Erro da API */}
        {apiError && (
          <div className="rounded-lg border border-destructive-border bg-destructive-light p-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <div>
          <Input placeholder="NOME*" value={name} onChange={setName} />
          {/* Exibe a mensagem de erro abaixo do input se houver erro no campo 'name' */}
          {getError('name') && <p className="mt-1 text-sm text-red-500">{getError('name')}</p>}
        </div>
        <div>
          <TextArea
            placeholder="DESCRIÇÃO"
            value={description}
            onChange={setDescription}
            rows={3}
          />
          {getError('description') && (
            <p className="mt-1 text-sm text-red-500">{getError('description')}</p>
          )}
        </div>

        <Button onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? 'Salvando...' : 'Editar'}
        </Button>
      </div>
    </>
  );
}

interface EditMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<{ error?: string } | void>;
  initialName: string;
  initialDescription: string;
}

// Componente wrapper que controla a renderização do modal
export default function EditMapModal({
  isOpen,
  onClose,
  onSubmit,
  initialName,
  initialDescription,
}: EditMapModalProps) {
  // Não renderiza nada se o modal estiver fechado
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* key força remontagem quando os valores iniciais mudam, resetando o estado */}
      <EditMapModalInner
        key={`${initialName}-${initialDescription}`}
        onClose={onClose}
        onSubmit={onSubmit}
        initialName={initialName}
        initialDescription={initialDescription}
      />
    </Modal>
  );
}
