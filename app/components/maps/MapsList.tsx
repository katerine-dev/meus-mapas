'use client';

import { useEffect, useState } from 'react';
import MapCard from './MapCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateMapModal from './CreateMapModal';
import EditMapModal from './EditMapModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import SearchBar from './SearchBar';
import Button from '../ui/Button';
import { Map } from '../../model/map';

interface MapsListProps {
  onCreateClick?: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export default function MapsList({ isCreateModalOpen, setIsCreateModalOpen }: MapsListProps) {
  const [maps, setMaps] = useState<Map[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mapa atualmente selecionado para edição/renomeação/exclusão
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  // Função assíncrona para buscar todos os mapas da API
  async function fetchMaps() {
    try {
      const response = await fetch('/api/maps'); // GET /api/maps
      if (!response.ok) throw new Error('Erro ao buscar mapas');
      const data = await response.json();
      setMaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaps();
  }, []); // Array vazio = executa apenas uma vez

  // Calcula a lista filtrada e ordenada diretamente
  const filteredMaps = maps
    .filter((map) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        map.name.toLowerCase().includes(query) || map.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        default: // 'recent'
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Função assíncrona para criar um novo mapa
  async function handleCreateMap(name: string, description: string) {
    try {
      const response = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (response.ok) {
        fetchMaps(); // Recarrega a lista após criar
      }
    } catch (err) {
      console.error('Erro ao criar mapa:', err);
    }
  }

  // Função assíncrona para editar nome e descrição de um mapa
  async function handleEditDescription(name: string, description: string) {
    if (!selectedMap) return;
    try {
      const response = await fetch(`/api/maps/${selectedMap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (response.ok) {
        fetchMaps();
      }
    } catch (err) {
      console.error('Erro ao editar descrição:', err);
    }
  }

  // Função assíncrona para deletar um mapa
  async function handleDeleteMap() {
    if (!selectedMap) return;
    try {
      const response = await fetch(`/api/maps/${selectedMap.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchMaps();
        setIsDeleteModalOpen(false);
        setSelectedMap(null);
      }
    } catch (err) {
      console.error('Erro ao deletar mapa:', err);
    }
  }

  function openEditModal(map: Map) {
    setSelectedMap(map);
    setIsEditModalOpen(true);
  }

  function openDeleteModal(map: Map) {
    setSelectedMap(map);
    setIsDeleteModalOpen(true);
  }

  function handleOpenMap(map: Map) {
    console.log('Abrindo mapa:', map.id);
    // TODO: Implementar navegação para página do mapa
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-purple-light">Carregando...</p>
      </div>
    );
  }

  // Renderização quando há erro
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Erro: {error}</p>
      </div>
      // TODO: Melhorar o visual da sinalização de erro
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de busca com botão de criar mapa ao lado direito */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar onSearch={setSearchQuery} onSortChange={setSortOption} />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="outlined"
          className="hidden h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow sm:flex"
        >
          <PlusIcon className="h-5 w-5" />
          <span>CRIAR NOVO MAPA</span>
        </Button>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="outlined"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow sm:hidden"
          aria-label="Criar novo mapa"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      {filteredMaps.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-purple-light">Nenhum mapa encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMaps.map((map) => (
            <MapCard
              key={map.id}
              id={map.id}
              name={map.name}
              description={map.description}
              updatedAt={map.updated_at}
              createdAt={map.created_at}
              onEdit={() => openEditModal(map)}
              onOpen={() => handleOpenMap(map)}
              onDelete={() => openDeleteModal(map)}
            />
          ))}
        </div>
      )}

      {/* Modal de criação de novo mapa */}
      <CreateMapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMap}
      />

      {/* Modal de editar */}
      <EditMapModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMap(null);
        }}
        onSubmit={handleEditDescription}
        initialName={selectedMap?.name || ''}
        initialDescription={selectedMap?.description || ''}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMap(null);
        }}
        onConfirm={handleDeleteMap}
      />
    </div>
  );
}
