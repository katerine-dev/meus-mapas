'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { SORT_OPTIONS } from '../../constants/sort';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSortChange: (sort: string) => void;
}

export default function SearchBar({ onSearch, onSortChange }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState(SORT_OPTIONS.recent);

  const handleSortSelect = (key: string) => {
    setCurrentSort(key);
    onSortChange(key);
    setSortOpen(false);
  };

  return (
    <div className="flex h-12 items-center justify-between gap-4 rounded-2xl bg-white px-4 shadow-sm">
      {/* Campo de busca */}
      <div className="flex flex-1 items-center gap-3">
        <MagnifyingGlassIcon className="text-purple-light h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar mapas..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="text-purple-darkest placeholder:text-purple-light flex-1 bg-transparent focus:outline-none"
        />
      </div>

      {/* Ordenação */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="text-purple-darkest hover:text-purple-main flex items-center gap-2 transition-colors"
        >
          <span className="text-sm font-medium">{SORT_OPTIONS[currentSort]}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>

        {/* Dropdown de ordenação */}
        {sortOpen && (
          <div className="absolute top-10 right-0 z-10 w-48 rounded-xl bg-white py-2 shadow-xl">
            {Object.keys(SORT_OPTIONS).map((key) => (
              <button
                key={key}
                onClick={() => handleSortSelect(key)}
                className={`hover:bg-purple-lightest/50 w-full px-4 py-2 text-left text-sm ${
                  currentSort === key ? 'text-purple-main font-medium' : 'text-purple-darkest'
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
