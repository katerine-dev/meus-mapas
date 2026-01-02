'use client';

import { useState } from 'react';
import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

interface PointModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialName: string;
  latitude: number;
  longitude: number;
  onSave: (name: string) => void;
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

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <>
      <h2 className="text-text-primary mb-4 text-xl font-bold">
        {mode === 'create' ? 'Novo ponto' : 'Editar ponto'}
      </h2>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="text-text-secondary mb-1 block text-sm font-medium">Nome</label>
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
            <label className="text-text-secondary mb-1 block text-sm font-medium">Latitude</label>
            <input
              type="text"
              value={latitude.toFixed(6)}
              readOnly
              disabled
              className="border-border bg-surface-hover text-text-muted w-full rounded-lg border px-4 py-3"
            />
          </div>
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">Longitude</label>
            <input
              type="text"
              value={longitude.toFixed(6)}
              readOnly
              disabled
              className="border-border bg-surface-hover text-text-muted w-full rounded-lg border px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} fullWidth disabled={!name.trim()}>
          Salvar
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
    <Modal isOpen={isOpen} onClose={onClose}>
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
