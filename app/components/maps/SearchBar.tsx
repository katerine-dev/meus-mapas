'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { SORT_OPTIONS, DEFAULT_SORT, type SortKey } from '../../constants/sort';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: SortKey) => void;
}

export default function SearchBar({ onSearch, onSortChange }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortKey>(DEFAULT_SORT);

  const handleSortSelect = (key: SortKey) => {
    setCurrentSort(key);
    onSortChange(key);
    setSortOpen(false);
  };

  return (
    <div className="flex h-12 items-center justify-between gap-2 rounded-2xl bg-white px-3 shadow-md sm:gap-4 sm:px-4">
      {/* Campo de busca */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar mapas..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="min-w-0 flex-1 bg-transparent text-text-primary placeholder:text-text-placeholder focus:outline-none"
        />
      </div>

      {/* Ordenação */}
      <div className="relative flex flex-shrink-0 items-center">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          aria-label="Ordenar mapas"
          aria-expanded={sortOpen}
          aria-haspopup="listbox"
          className="flex items-center gap-1 text-text-primary transition-colors hover:text-primary sm:gap-2"
        >
          <span className="text-xs font-medium sm:text-sm">{SORT_OPTIONS[currentSort]}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>

        {/* Dropdown de ordenação */}
        {sortOpen && (
          <div className="absolute right-0 top-10 z-10 w-48 rounded-xl bg-white py-2 shadow-xl">
            {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => handleSortSelect(key)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-surface-hover ${
                  currentSort === key ? 'font-medium text-primary' : 'text-text-primary'
                }`}
              >
                {SORT_OPTIONS[key]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
