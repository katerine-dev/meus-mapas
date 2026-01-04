'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MapCard from './MapCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import MapFormModal from './MapFormModal';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import SearchBar from './SearchBar';
import Button from '@/app/components/ui/Button';
import ErrorState from '@/app/components/ui/ErrorState';
import Spinner from '@/app/components/ui/Spinner';
import { Map } from '@/app/model/map';
import { DEFAULT_SORT, type SortKey } from './sort';
import { getAllMaps, createMap, updateMap, deleteMap } from '@/lib/services/maps';
import { DuplicateNameError } from '@/lib/errors';

interface MapsListProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export default function MapsList({ isCreateModalOpen, setIsCreateModalOpen }: MapsListProps) {
  const router = useRouter();
  const [maps, setMaps] = useState<Map[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortKey>(DEFAULT_SORT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mapa atualmente selecionado para edição/renomeação/exclusão
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  // Função assíncrona para buscar todos os mapas da API
  async function fetchMaps() {
    try {
      const data = await getAllMaps();
      setMaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaps(); // Busca os mapas da API
  }, []); // [] = só executa quando o componente monta

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
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        default: // 'recent'
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  // Função assíncrona para criar um novo mapa
  async function handleCreateMap(
    name: string,
    description: string
  ): Promise<{ error?: string } | void> {
    try {
      await createMap({ name, description });
      fetchMaps();
      setIsCreateModalOpen(false);
    } catch (err) {
      if (err instanceof DuplicateNameError) {
        return { error: err.message };
      }
      console.error('Erro ao criar mapa:', err);
      return { error: 'Erro ao criar mapa. Tente novamente.' };
    }
  }

  // Função assíncrona para editar nome e descrição de um mapa
  async function handleEditDescription(
    name: string,
    description: string
  ): Promise<{ error?: string } | void> {
    if (!selectedMap) return;
    try {
      await updateMap(selectedMap.id, { name, description });
      fetchMaps();
      setIsEditModalOpen(false);
      setSelectedMap(null);
    } catch (err) {
      if (err instanceof DuplicateNameError) {
        return { error: err.message };
      }
      console.error('Erro ao editar descrição:', err);
      return { error: 'Erro ao editar mapa. Tente novamente.' };
    }
  }

  // Função assíncrona para deletar um mapa
  async function handleDeleteMap(): Promise<{ error?: string } | void> {
    if (!selectedMap) return;
    try {
      await deleteMap(selectedMap.id);
      fetchMaps();
      setIsDeleteModalOpen(false);
      setSelectedMap(null);
    } catch (err) {
      console.error('Erro ao deletar mapa:', err);
      return { error: 'Erro ao excluir mapa. Tente novamente.' };
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
    router.push(`/maps/${map.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  // Renderização quando há erro
  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar mapas"
        message={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          fetchMaps();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de busca com botão de criar mapa ao lado direito */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
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
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow sm:hidden"
          aria-label="Criar novo mapa"
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>

      {filteredMaps.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-text-muted">Nenhum mapa encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMaps.map((map) => (
            <MapCard
              key={map.id}
              map={map}
              onEdit={() => openEditModal(map)}
              onOpen={() => handleOpenMap(map)}
              onDelete={() => openDeleteModal(map)}
            />
          ))}
        </div>
      )}

      {/* Modal de criação de novo mapa */}
      <MapFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMap}
        mode="create"
      />

      {/* Modal de editar */}
      <MapFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMap(null);
        }}
        onSubmit={handleEditDescription}
        mode="edit"
        initialName={selectedMap?.name}
        initialDescription={selectedMap?.description}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMap(null);
        }}
        onConfirm={handleDeleteMap}
        title="Excluir mapa"
        message="Esta ação não pode ser desfeita. Deseja continuar?"
      />
    </div>
  );
}
