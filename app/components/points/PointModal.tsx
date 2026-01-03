'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ErrorMessage from '@/app/components/ui/ErrorMessage';

interface PointModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialName: string;
  latitude: number;
  longitude: number;
  onSave: (name: string) => Promise<{ error?: string } | void>;
}

// Componente interno que gerencia o estado - só é montado quando o modal abre
function PointModalContent({
  mode,
  initialName,
  latitude,
  longitude,
  onClose,
  onSave,
}: Omit<PointModalProps, 'isOpen'>) {
  // Estado inicializado com o valor da prop - sem useEffect
  const [name, setName] = useState(initialName);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setApiError(null);
    setLoading(true);

    try {
      const result = await onSave(name.trim());

      if (result?.error) {
        setApiError(result.error);
        setLoading(false);
        return;
      }

      // Sucesso - o modal será fechado pelo componente pai
    } catch {
      setApiError('Erro ao salvar ponto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 id="point-modal-title" className="mb-4 text-xl font-bold text-text-primary">
        {mode === 'create' ? 'Novo ponto' : 'Editar ponto'}
      </h2>

      {/* Erro da API */}
      <div className="mb-4">
        <ErrorMessage message={apiError} />
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Nome</label>
          <Input
            value={name}
            onChange={setName}
            placeholder="Nome do ponto"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Coordenadas (readOnly) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Latitude</label>
            <input
              type="text"
              value={latitude.toFixed(6)}
              readOnly
              disabled
              className="w-full rounded-lg border border-border bg-surface-hover px-4 py-3 text-text-muted"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Longitude</label>
            <input
              type="text"
              value={longitude.toFixed(6)}
              readOnly
              disabled
              className="w-full rounded-lg border border-border bg-surface-hover px-4 py-3 text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} fullWidth disabled={!name.trim() || loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </>
  );
}

export default function PointModal({
  isOpen,
  onClose,
  mode,
  initialName,
  latitude,
  longitude,
  onSave,
}: PointModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="point-modal-title">
      {isOpen && (
        <PointModalContent
          mode={mode}
          initialName={initialName}
          latitude={latitude}
          longitude={longitude}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
}
