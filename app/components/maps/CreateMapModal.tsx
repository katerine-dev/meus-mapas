'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';

interface CreateMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

// Componente modal para criar um novo mapa
export default function CreateMapModal({ isOpen, onClose, onSubmit }: CreateMapModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmit(name, description);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Título */}
        <div className="flex justify-center">
          <h1 className="text-purple-main text-2xl font-semibold">Criar Novo Mapa</h1>
        </div>

        <Input placeholder="NOME" value={name} onChange={setName} />

        <TextArea placeholder="DESCRIÇÃO" value={description} onChange={setDescription} rows={3} />

        <Button onClick={handleSubmit} fullWidth>
          Criar
        </Button>
      </div>
    </Modal>
  );
}
