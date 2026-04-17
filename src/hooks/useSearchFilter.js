// src/hooks/useSearchFilter.js
import { useState, useMemo } from 'react';

export const useSearchFilter = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }, [items, searchTerm, searchFields]);

  return { searchTerm, setSearchTerm, filteredItems };
};