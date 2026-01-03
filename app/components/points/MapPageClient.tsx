'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Point } from '@/app/model/point';
import { Map } from '@/app/model/map';
import PointsList from './PointsList';
import PointModal from './PointModal';
import ConfirmModal from './ConfirmModal';
import LocationSearch from './LocationSearch';

// Import dinâmico do mapa para evitar SSR (Leaflet não funciona no servidor)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-main" />
    </div>
  ),
});

interface MapPageClientProps {
  mapId: string;
}

export default function MapPageClient({ mapId }: MapPageClientProps) {
  // Estado do mapa
  const [map, setMap] = useState<Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de seleção e edição
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  // Estado dos modais
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [pointModalMode, setPointModalMode] = useState<'create' | 'edit'>('create');
  const [pointModalData, setPointModalData] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  }>({ name: '', latitude: 0, longitude: 0 });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalMode, setConfirmModalMode] = useState<'single' | 'all'>('single');
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);

  // Centro do mapa (São Paulo por padrão)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);

  // Buscar dados do mapa e pontos
  const fetchData = useCallback(async () => {
    try {
      const [mapRes, pointsRes] = await Promise.all([
        fetch(`/api/maps/${mapId}`),
        fetch(`/api/maps/${mapId}/points`),
      ]);

      if (mapRes.ok) {
        const mapData = await mapRes.json();
        setMap(mapData);
        setDescriptionValue(mapData.description || '');
      }

      if (pointsRes.ok) {
        const pointsData = await pointsRes.json();
        setPoints(pointsData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers do mapa
  const handleMapClick = useCallback((lat: number, lng: number) => {
    console.log('handleMapClick called:', lat, lng);
    setPointModalMode('create');
    setPointModalData({ name: '', latitude: lat, longitude: lng });
    setPointModalOpen(true);
  }, []);

  const handleLocationFound = (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
  };

  // Handlers de pontos
  const handleSelectPoint = (pointId: string) => {
    if (pointId === selectedPointId) {
      setSelectedPointId(null);
    } else {
      setSelectedPointId(pointId);
      // Centralizar o mapa no ponto selecionado
      const point = points.find((p) => p.id === pointId);
      if (point) {
        setMapCenter([point.location.latitude, point.location.longitude]);
      }
    }
  };

  const handleEditPoint = (point: Point) => {
    setPointModalMode('edit');
    setPointModalData({
      name: point.name,
      latitude: point.location.latitude,
      longitude: point.location.longitude,
    });
    setSelectedPointId(point.id);
    setPointModalOpen(true);
  };

  const handleDeletePoint = (pointId: string) => {
    setPointToDelete(pointId);
    setConfirmModalMode('single');
    setConfirmModalOpen(true);
  };

  const handleDeleteAllPoints = () => {
    setConfirmModalMode('all');
    setConfirmModalOpen(true);
  };

  // Salvar ponto (criar ou editar)
  const handleSavePoint = async (name: string) => {
    try {
      if (pointModalMode === 'create') {
        const res = await fetch(`/api/maps/${mapId}/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            latitude: pointModalData.latitude,
            longitude: pointModalData.longitude,
          }),
        });
        if (res.ok) {
          await fetchData();
        }
      } else {
        const res = await fetch(`/api/maps/${mapId}/points/${selectedPointId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            latitude: pointModalData.latitude,
            longitude: pointModalData.longitude,
          }),
        });
        if (res.ok) {
          await fetchData();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar ponto:', error);
    }
    setPointModalOpen(false);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    try {
      if (confirmModalMode === 'single' && pointToDelete) {
        await fetch(`/api/maps/${mapId}/points/${pointToDelete}`, {
          method: 'DELETE',
        });
      } else if (confirmModalMode === 'all') {
        // Deletar todos os pontos
        await Promise.all(
          points.map((point) =>
            fetch(`/api/maps/${mapId}/points/${point.id}`, {
              method: 'DELETE',
            })
          )
        );
      }
      await fetchData();
      setSelectedPointId(null);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
    setConfirmModalOpen(false);
    setPointToDelete(null);
  };

  // Salvar descrição do mapa
  const handleSaveDescription = async () => {
    try {
      await fetch(`/api/maps/${mapId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: map?.name,
          description: descriptionValue,
        }),
      });
      setMap((prev) => (prev ? { ...prev, description: descriptionValue } : null));
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
    }
    setEditingDescription(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-main" />
      </div>
    );
  }

  if (!map) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">Mapa não encontrado</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Mapa em tela cheia */}
      <div className="absolute inset-0">
        <LeafletMap
          center={mapCenter}
          points={points}
          selectedPointId={selectedPointId}
          onMapClick={handleMapClick}
          onMarkerClick={handleSelectPoint}
        />
      </div>

      {/* Busca de localização - flutuante no topo */}
      <div className="absolute left-1/2 top-4 z-[1000] w-full max-w-md -translate-x-1/2 px-4">
        <div className="rounded-xl bg-white shadow-lg">
          <div className="p-2">
            <LocationSearch onLocationFound={handleLocationFound} />
          </div>
        </div>
      </div>

      {/* Painel lateral flutuante */}
      <div className="absolute bottom-4 left-4 top-4 z-[1000] flex w-80 flex-col gap-4 overflow-hidden">
        {/* Info do mapa */}
        <div className="card-interactive overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          {/* Header com roxo sólido */}
          <div className="flex items-center justify-between bg-primary px-5 py-4">
            <h1 className="text-lg font-semibold text-white">{map.name}</h1>
            {!editingDescription && (
              <button
                onClick={() => setEditingDescription(true)}
                className="icon-interactive rounded-full p-2 text-white/70 hover:bg-white/20 hover:text-white"
                title="Editar descrição"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-4">
            {!editingDescription ? (
              <p className="text-sm text-text-muted">{map.description || 'Sem descrição'}</p>
            ) : (
              <div>
                <textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  className="focus:ring-focus-ring/30 w-full rounded-xl border border-border p-2.5 text-sm text-text-primary placeholder:text-text-placeholder focus:border-primary focus:outline-none focus:ring-2"
                  rows={2}
                  placeholder="Adicione uma descrição..."
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setDescriptionValue(map.description || '');
                    }}
                    className="btn-interactive rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    className="btn-interactive rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de pontos */}
        <div className="card-interactive min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <PointsList
            points={points}
            selectedPointId={selectedPointId}
            onSelectPoint={handleSelectPoint}
            onEditPoint={handleEditPoint}
            onDeletePoint={handleDeletePoint}
          />
        </div>

        {/* Botão excluir todos - outline vermelho discreto */}
        <button
          onClick={handleDeleteAllPoints}
          disabled={points.length === 0}
          className="btn-interactive focus:ring-destructive/30 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive-border bg-surface px-3 py-2.5 text-sm text-destructive shadow-sm hover:bg-destructive-light hover:shadow-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:opacity-50 disabled:hover:bg-surface disabled:hover:shadow-sm"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Excluir todos</span>
        </button>
      </div>

      {/* Modal de ponto */}
      <PointModal
        isOpen={pointModalOpen}
        onClose={() => setPointModalOpen(false)}
        mode={pointModalMode}
        initialName={pointModalData.name}
        latitude={pointModalData.latitude}
        longitude={pointModalData.longitude}
        onSave={handleSavePoint}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          confirmModalMode === 'single'
            ? 'Você está apagando um ponto'
            : 'Você está apagando TODOS os pontos desse mapa'
        }
        message="Você tem certeza disso?"
      />
    </div>
  );
}
