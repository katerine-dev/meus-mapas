'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Point } from '@/app/model/point';
import Spinner from '../ui/Spinner';

interface LocationSearchProps {
  onLocationFound: (lat: number, lng: number, name?: string, isExistingPoint?: boolean) => void;
  points?: Point[];
}

interface FoundLocation {
  name: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  type: 'point' | 'search';
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export default function LocationSearch({ onLocationFound, points = [] }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [foundLocation, setFoundLocation] = useState<FoundLocation | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<Suggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Filtrar pontos existentes baseado na query
  const pointSuggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    return points
      .filter((point) => point.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((point) => ({
        type: 'point' as const,
        name: point.name,
        description: undefined,
        lat: point.location.latitude,
        lng: point.location.longitude,
      }));
  }, [query, points]);

  // Buscar sugestões da API com debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setApiSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();

        const suggestions: Suggestion[] = data.map(
          (item: { display_name: string; lat: string; lon: string }) => ({
            type: 'search' as const,
            name: item.display_name.split(',')[0],
            description: item.display_name.split(',').slice(1, 3).join(',').trim(),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          })
        );

        setApiSuggestions(suggestions);
      } catch {
        setApiSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Combinar sugestões (pontos primeiro, depois API) - limitado a 4 para caber no mobile
  const allSuggestions = useMemo(() => {
    return [...pointSuggestions, ...apiSuggestions].slice(0, 4);
  }, [pointSuggestions, apiSuggestions]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
      const isExistingPoint = suggestion.type === 'point';
      onLocationFound(suggestion.lat, suggestion.lng, suggestion.name, isExistingPoint);

      // Só mostra chip de sucesso para pontos existentes
      if (isExistingPoint) {
        setFoundLocation({
          name: suggestion.name,
          lat: suggestion.lat,
          lng: suggestion.lng,
        });
      }
    }
    setQuery('');
    setShowSuggestions(false);
    setApiSuggestions([]);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);
    setFoundLocation(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);
        const locationName = display_name.split(',')[0];
        onLocationFound(parsedLat, parsedLng, locationName, false);
        // Não mostra chip - vai abrir o modal
        setQuery('');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const clearFoundLocation = () => {
    setFoundLocation(null);
  };

  return (
    <div className="relative flex flex-col gap-2" ref={containerRef}>
      <div className="flex gap-0">
        {/* Input com borda integrada */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(false);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
                setShowSuggestions(false);
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            placeholder="Buscar endereço ou local..."
            className={`h-11 w-full rounded-l-xl border-y border-l bg-surface px-4 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
              error
                ? 'placeholder:text-destructive/50 focus:ring-destructive/20 border-destructive-border text-destructive'
                : 'focus:ring-focus-ring/30 border-border text-text-primary placeholder:text-text-placeholder focus:border-primary'
            }`}
          />
          {/* Spinner de loading */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Botão de busca integrado */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`flex h-11 w-12 items-center justify-center rounded-r-xl border-y border-r transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring ${
            error
              ? 'border-destructive-border bg-destructive-light text-destructive'
              : 'border-border bg-primary text-white hover:bg-primary-hover disabled:bg-surface-hover disabled:text-text-muted'
          }`}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Lista de sugestões */}
      {showSuggestions && allSuggestions.length > 0 && (
        <div className="absolute top-12 z-[1000] max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg">
          <ul className="divide-y divide-border py-1">
            {allSuggestions.map((suggestion, index) => (
              <li key={`${suggestion.type}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <MapPinIcon
                    className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                      suggestion.type === 'point' ? 'text-primary' : 'text-text-muted'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {suggestion.name}
                    </p>
                    {suggestion.description && (
                      <p className="truncate text-xs text-text-muted">{suggestion.description}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
            {/* Opção de buscar na região */}
            {query.length >= 2 && (
              <li>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-text-muted" />
                  <p className="text-sm text-text-muted">
                    <span className="font-medium">{query}</span>
                    <span className="ml-1 text-xs">
                      Pesquisar lugares por perto da visualização atual
                    </span>
                  </p>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <XMarkIcon className="h-3 w-3" />
          Local não encontrado. Tente outro termo.
        </p>
      )}

      {/* Chip de sucesso */}
      {foundLocation && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs text-success">
            <MapPinIcon className="h-3.5 w-3.5" />
            <span className="max-w-[200px] truncate">{foundLocation.name}</span>
            <button
              onClick={clearFoundLocation}
              className="hover:bg-success/10 ml-1 rounded-full p-0.5"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
