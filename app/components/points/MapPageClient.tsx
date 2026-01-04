'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Point, Location } from '@/app/model/point';
import { Map } from '@/app/model/map';
import PointModal from './PointModal';
import MapSidebar from './MapSidebar';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import LocationSearch from './LocationSearch';
import ErrorState from '@/app/components/ui/ErrorState';
import Spinner from '@/app/components/ui/Spinner';
import { getMapById, updateMap } from '@/lib/services/maps';
import {
  getAllPoints,
  createPoint,
  updatePoint,
  deletePoint,
  deleteAllPoints,
} from '@/lib/services/points';
import { DuplicateNameError } from '@/lib/errors';

// Import dinâmico do mapa para evitar SSR (Leaflet não funciona no servidor)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-hover">
      <Spinner />
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
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  // Estado dos modais
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [pointModalMode, setPointModalMode] = useState<'create' | 'edit'>('create');
  const [pointModalData, setPointModalData] = useState<{ name: string; location: Location }>({
    name: '',
    location: { latitude: 0, longitude: 0 },
  });

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalMode, setConfirmModalMode] = useState<'single' | 'all'>('single');
  const [pointToDelete, setPointToDelete] = useState<string | null>(null);

  // Estado para painel mobile
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Centro do mapa
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [centerInitialized, setCenterInitialized] = useState(false);

  // Estado para ponto temporário (buscado mas ainda não salvo)
  const [tempPoint, setTempPoint] = useState<{ name: string; location: Location } | null>(null);

  // Inicializar o centro do mapa
  // Se há pontos, centraliza no último. Se não há, tenta geolocalização do usuário.
  useEffect(() => {
    if (!loading && !centerInitialized) {
      if (points.length > 0) {
        // Pegar o último ponto (mais recente)
        const lastPoint = points[points.length - 1];
        setMapCenter([lastPoint.location.latitude, lastPoint.location.longitude]);
        setCenterInitialized(true);
      } else {
        // Sem pontos - tenta usar a localização do usuário
        // O browser irá pedir autorização automaticamente
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setMapCenter([position.coords.latitude, position.coords.longitude]);
              setCenterInitialized(true);
            },
            () => {
              // Usuário negou ou erro - usa fallback (São Paulo)
              setMapCenter(SAO_PAULO_COORDS);
              setCenterInitialized(true);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 600000, // Cache de 10 minutos
            }
          );
        } else {
          // Geolocalização não suportada - usa fallback
          setMapCenter(SAO_PAULO_COORDS);
          setCenterInitialized(true);
        }
      }
    }
  }, [loading, points, centerInitialized]);

  // Buscar dados do mapa e pontos
  const fetchData = useCallback(async () => {
    try {
      const [mapData, pointsData] = await Promise.all([getMapById(mapId), getAllPoints(mapId)]);

      setMap(mapData);
      setNameValue(mapData.name || '');
      setDescriptionValue(mapData.description || '');
      setPoints(pointsData);
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
    setPointModalMode('create');
    setPointModalData({ name: '', location: { latitude: lat, longitude: lng } });
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
      setTempPoint({ name, location: { latitude: lat, longitude: lng } });
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
      location: point.location,
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
        await createPoint(mapId, {
          name,
          latitude: pointModalData.location.latitude,
          longitude: pointModalData.location.longitude,
        });
        await fetchData();
        setTempPoint(null);
        setPointModalOpen(false);
      } else {
        await updatePoint(mapId, selectedPointId!, { name });
        await fetchData();
        setPointModalOpen(false);
      }
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        return { error: error.message };
      }
      console.error('Erro ao salvar ponto:', error);
      return { error: 'Erro ao salvar ponto. Tente novamente.' };
    }
  };

  // Confirmar exclusão
  const handleConfirmDelete = async (): Promise<{ error?: string } | void> => {
    try {
      if (confirmModalMode === 'single' && pointToDelete) {
        await deletePoint(mapId, pointToDelete);
      } else if (confirmModalMode === 'all') {
        await deleteAllPoints(mapId);
      }
      await fetchData();
      setSelectedPointId(null);
      setConfirmModalOpen(false);
      setPointToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar:', error);
      return { error: 'Erro ao excluir. Tente novamente.' };
    }
  };

  // Salvar nome do mapa
  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    try {
      await updateMap(mapId, {
        name: nameValue.trim(),
        description: map?.description,
      });
      setMap((prev) => (prev ? { ...prev, name: nameValue.trim() } : null));
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
    }
    setEditingName(false);
  };

  // Salvar descrição do mapa
  const handleSaveDescription = async () => {
    try {
      await updateMap(mapId, {
        name: map?.name || '',
        description: descriptionValue,
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
        <Spinner />
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
        <Spinner label="Carregando mapa..." />
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

      {/* Sidebar: Desktop (painel lateral) + Mobile (drawer) */}
      <MapSidebar
        map={map}
        points={points}
        selectedPointId={selectedPointId}
        mobileDrawerOpen={mobileDrawerOpen}
        onMobileDrawerToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        editingName={editingName}
        nameValue={nameValue}
        onNameValueChange={setNameValue}
        onEditName={() => setEditingName(true)}
        onCancelEditName={() => {
          setEditingName(false);
          setNameValue(map.name || '');
        }}
        onSaveName={handleSaveName}
        editingDescription={editingDescription}
        descriptionValue={descriptionValue}
        onDescriptionValueChange={setDescriptionValue}
        onEditDescription={() => setEditingDescription(true)}
        onCancelEditDescription={() => {
          setEditingDescription(false);
          setDescriptionValue(map.description || '');
        }}
        onSaveDescription={handleSaveDescription}
        onSelectPoint={handleSelectPoint}
        onEditPoint={handleEditPoint}
        onDeletePoint={handleDeletePoint}
        onDeleteAllPoints={handleDeleteAllPoints}
        onLocationFound={handleLocationFound}
      />

      {/* Modal de ponto */}
      <PointModal
        isOpen={pointModalOpen}
        onClose={() => {
          setPointModalOpen(false);
          // Não limpa tempPoint ao fechar - permite clicar novamente no marcador
        }}
        mode={pointModalMode}
        initialName={pointModalData.name}
        latitude={pointModalData.location.latitude}
        longitude={pointModalData.location.longitude}
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
