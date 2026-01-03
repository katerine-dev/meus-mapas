'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Point } from '@/app/model/point';
import { Map } from '@/app/model/map';
import PointsList from './PointsList';
import PointModal from './PointModal';
import ConfirmModal from './ConfirmModal';
import LocationSearch from './LocationSearch';
import ErrorState from '../ui/ErrorState';

// Import dinâmico do mapa para evitar SSR (Leaflet não funciona no servidor)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-main" />
    </div>
  ),
});

// Coordenadas de fallback (São Paulo)
const SAO_PAULO_COORDS: [number, number] = [-23.5505, -46.6333];

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

  // Estado para painel mobile
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Centro do mapa
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [centerInitialized, setCenterInitialized] = useState(false);

  // Estado para geolocalização
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);
  const [geoLocationAttempted, setGeoLocationAttempted] = useState(false);

  // Estado para ponto temporário (buscado mas ainda não salvo)
  const [tempPoint, setTempPoint] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Handler para usar localização do usuário
  const handleUseMyLocation = useCallback(() => {
    if (geoLocationLoading) return;

    setGeoLocationLoading(true);
    setGeoLocationAttempted(true);

    if (!('geolocation' in navigator)) {
      console.log('Geolocalização não suportada pelo navegador');
      setMapCenter(SAO_PAULO_COORDS);
      setGeoLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setGeoLocationLoading(false);
      },
      (error) => {
        console.log('Erro ao obter localização:', error.message);
        setMapCenter(SAO_PAULO_COORDS);
        setGeoLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // Cache de 10 minutos
      }
    );
  }, [geoLocationLoading]);

  // Centralizar no último ponto quando há pontos cadastrados
  useEffect(() => {
    if (!loading && !centerInitialized) {
      if (points.length > 0) {
        // Pegar o último ponto (mais recente)
        const lastPoint = points[points.length - 1];
        setMapCenter([lastPoint.location.latitude, lastPoint.location.longitude]);
      } else {
        // Sem pontos, usa São Paulo como padrão
        setMapCenter(SAO_PAULO_COORDS);
      }
      setCenterInitialized(true);
    }
  }, [loading, points, centerInitialized]);

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

  const handleLocationFound = (
    lat: number,
    lng: number,
    name?: string,
    isExistingPoint?: boolean
  ) => {
    setMapCenter([lat, lng]);

    // Se for um local buscado (não um ponto existente), cria ponto temporário
    if (name && !isExistingPoint) {
      setTempPoint({ name, latitude: lat, longitude: lng });
      setSelectedPointId(null); // Limpa seleção de pontos existentes
    }

    // Se for um ponto existente, seleciona ele
    if (isExistingPoint) {
      setTempPoint(null); // Limpa ponto temporário
      const point = points.find((p) => p.name === name);
      if (point) {
        setSelectedPointId(point.id);
      }
    }
  };

  // Handler para clicar no ponto temporário
  const handleTempPointClick = useCallback(() => {
    if (tempPoint) {
      setPointModalMode('create');
      setPointModalData(tempPoint);
      setPointModalOpen(true);
    }
  }, [tempPoint]);

  // Handlers de pontos
  const handleSelectPoint = (pointId: string) => {
    setTempPoint(null); // Limpar ponto temporário ao selecionar um ponto existente
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
  const handleSavePoint = async (name: string): Promise<{ error?: string } | void> => {
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

        if (res.status === 409) {
          const data = await res.json();
          return { error: data.error || 'Já existe um ponto com este nome' };
        }

        if (res.ok) {
          await fetchData();
          setTempPoint(null); // Limpar ponto temporário após salvar
          setPointModalOpen(false);
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

        if (res.status === 409) {
          const data = await res.json();
          return { error: data.error || 'Já existe um ponto com este nome' };
        }

        if (res.ok) {
          await fetchData();
          setPointModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar ponto:', error);
      return { error: 'Erro ao salvar ponto. Tente novamente.' };
    }
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
        <ErrorState
          title="Mapa não encontrado"
          message="O mapa que você está procurando não existe ou foi removido."
        />
      </div>
    );
  }

  // Aguardar o centro ser definido antes de renderizar o mapa
  if (!mapCenter) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Carregando mapa...</span>
        </div>
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
          tempPoint={tempPoint}
          onTempPointClick={handleTempPointClick}
        />
      </div>

      {/* Botão "Usar minha localização" - só aparece quando não há pontos e não tentou geolocalização */}
      {points.length === 0 && !geoLocationAttempted && (
        <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 md:bottom-8">
          <button
            onClick={handleUseMyLocation}
            disabled={geoLocationLoading}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl disabled:opacity-70"
          >
            {geoLocationLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Obtendo localização...</span>
              </>
            ) : (
              <>
                <MapPinIcon className="h-5 w-5" />
                <span>Usar minha localização</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Busca de localização - flutuante no topo (hidden no mobile quando drawer aberto) */}
      <div
        className={`absolute left-1/2 top-4 z-[1000] w-full max-w-md -translate-x-1/2 px-4 transition-opacity md:opacity-100 ${mobileDrawerOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <div className="rounded-xl bg-white shadow-lg">
          <div className="p-2">
            <LocationSearch onLocationFound={handleLocationFound} points={points} />
          </div>
        </div>
      </div>

      {/* Painel lateral flutuante - Desktop */}
      <div className="absolute bottom-4 left-4 top-4 z-[1000] hidden w-80 flex-col gap-4 overflow-hidden md:flex">
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

      {/* Drawer Mobile - Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] md:hidden">
        {/* Handle para expandir/colapsar */}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="mx-auto flex w-full items-center justify-center rounded-t-2xl bg-white px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>
        </button>

        {/* Conteúdo do drawer */}
        <div
          className={`bg-white transition-all duration-300 ease-in-out ${mobileDrawerOpen ? 'max-h-[50vh]' : 'max-h-14'} overflow-hidden`}
        >
          {/* Header do mapa - sempre visível */}
          <div
            className="flex cursor-pointer items-center justify-between bg-primary px-4 py-3"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          >
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-white" />
              <h1 className="font-semibold text-white">{map.name}</h1>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {points.length} pontos
              </span>
            </div>
            {mobileDrawerOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-white" />
            ) : (
              <ChevronUpIcon className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Conteúdo expandido */}
          {mobileDrawerOpen && (
            <div className="flex max-h-[calc(50vh-48px)] flex-col overflow-hidden">
              {/* Descrição */}
              <div className="border-b border-border p-3">
                {!editingDescription ? (
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-text-muted">{map.description || 'Sem descrição'}</p>
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="ml-2 rounded-full p-1 text-text-muted hover:bg-surface-hover hover:text-primary"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={descriptionValue}
                      onChange={(e) => setDescriptionValue(e.target.value)}
                      className="w-full rounded-lg border border-border p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={2}
                      placeholder="Adicione uma descrição..."
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingDescription(false);
                          setDescriptionValue(map.description || '');
                        }}
                        className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveDescription}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Busca de localização no mobile */}
              <div className="border-b border-border p-3">
                <LocationSearch onLocationFound={handleLocationFound} points={points} />
              </div>

              {/* Lista de pontos */}
              <div className="min-h-0 flex-1 overflow-auto">
                <PointsList
                  points={points}
                  selectedPointId={selectedPointId}
                  onSelectPoint={(pointId) => {
                    handleSelectPoint(pointId);
                    setMobileDrawerOpen(false);
                  }}
                  onEditPoint={handleEditPoint}
                  onDeletePoint={handleDeletePoint}
                />
              </div>

              {/* Botão excluir todos */}
              <div className="border-t border-border p-3">
                <button
                  onClick={handleDeleteAllPoints}
                  disabled={points.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive-border py-2 text-sm text-destructive hover:bg-destructive-light disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Excluir todos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de ponto */}
      <PointModal
        isOpen={pointModalOpen}
        onClose={() => {
          setPointModalOpen(false);
          // Não limpa tempPoint ao fechar - permite clicar novamente no marcador
        }}
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
