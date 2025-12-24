'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';

interface EditMapModalInnerProps {
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
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

  // Função executada ao submeter o formulário
  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name, description);
      onClose();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <h1 className="text-purple-main text-2xl font-semibold">Editar Mapa</h1>
        </div>

        <Input placeholder="NOME" value={name} onChange={setName} />

        <TextArea placeholder="DESCRIÇÃO" value={description} onChange={setDescription} rows={3} />

        <Button onClick={handleSubmit} fullWidth>
          Editar
        </Button>
      </div>
    </>
  );
}

interface EditMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
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
