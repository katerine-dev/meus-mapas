'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface LocationSearchProps {
  onLocationFound: (lat: number, lng: number) => void;
}

interface FoundLocation {
  name: string;
  lat: number;
  lng: number;
}

export default function LocationSearch({ onLocationFound }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [foundLocation, setFoundLocation] = useState<FoundLocation | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);
    setFoundLocation(null);

    try {
      // Usa a API Nominatim do OpenStreetMap para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lon);
        onLocationFound(parsedLat, parsedLng);
        setFoundLocation({
          name: display_name.split(',').slice(0, 2).join(','),
          lat: parsedLat,
          lng: parsedLng,
        });
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
    <div className="flex flex-col gap-2">
      <div className="flex gap-0">
        {/* Input com borda integrada */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar endereço ou local..."
            className={`bg-surface h-11 w-full rounded-l-xl border-y border-l px-4 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
              error
                ? 'border-destructive-border text-destructive placeholder:text-destructive/50 focus:ring-destructive/20'
                : 'border-border text-text-primary placeholder:text-text-placeholder focus:border-primary focus:ring-focus-ring/30'
            }`}
          />
          {/* Spinner de loading */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="border-primary-muted border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
            </div>
          )}
        </div>

        {/* Botão de busca integrado */}
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className={`focus:ring-focus-ring flex h-11 w-12 items-center justify-center rounded-r-xl border-y border-r transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-destructive-border bg-destructive-light text-destructive'
              : 'border-border bg-primary hover:bg-primary-hover disabled:bg-surface-hover disabled:text-text-muted text-white'
          }`}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-destructive flex items-center gap-1 text-xs">
          <XMarkIcon className="h-3 w-3" />
          Local não encontrado. Tente outro termo.
        </p>
      )}

      {/* Chip de sucesso */}
      {foundLocation && (
        <div className="flex items-center gap-2">
          <div className="bg-success-light text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
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
