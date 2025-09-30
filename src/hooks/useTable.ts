// hooks/useDataList.ts
import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

// Définit une colonne avec ses propriétés
export interface ColumnDef<T> {
  key: keyof T | string; // Peut être une clé directe ou un chemin (ex: "media.title")
  sortable?: boolean; // Si la colonne peut être triée
  filterable?: boolean; // Si la colonne peut être filtrée
  getValue?: (item: T) => any; // Fonction personnalisée pour extraire la valeur (optionnel)
}

// Définit une option de tri
export interface SortOption<T> {
  column: ColumnDef<T>;
  direction: SortDirection;
}

// Définit une option de filtre
export interface FilterOption<T> {
  column: ColumnDef<T>;
  value: string | number | boolean;
}

export const useDataList = <T>(initialData: T[], columns: ColumnDef<T>[]) => {
  const [sort, setSort] = useState<SortOption<T> | null>(null);
  const [filters, setFilters] = useState<FilterOption<T>[]>([]);

  const processedData = useMemo(() => {
    let result = [...initialData];

    // Appliquer les filtres
    if (filters.length > 0) {
      result = result.filter((item) =>
        filters.every((filter) => {
          const column = filter.column;
          const value = column.getValue
            ? column.getValue(item)
            : (item[column.key as keyof T] as any); // Assume que la clé existe ou utilise getValue
          return value?.toString().toLowerCase().includes(String(filter.value).toLowerCase());
        })
      );
    }

    // Appliquer le tri
    if (sort) {
      result.sort((a, b) => {
        const column = sort.column;
        const aValue = column.getValue ? column.getValue(a) : (a[column.key as keyof T] as any);
        const bValue = column.getValue ? column.getValue(b) : (b[column.key as keyof T] as any);

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sort.direction === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
      });
    }

    return result;
  }, [initialData, sort, filters]);

  // Méthodes pour manipuler le tri et les filtres
  const toggleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;
    setSort((prev) => {
      if (prev?.column.key === column.key) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  };

  const applyFilter = (filter: FilterOption<T>) => {
    if (!filter.column.filterable) return;
    setFilters((prev) => {
      const existing = prev.find((f) => f.column.key === filter.column.key);
      if (existing) {
        return prev.map((f) => (f.column.key === filter.column.key ? filter : f));
      }
      return [...prev, filter];
    });
  };

  const clearFilter = (columnKey: string) => {
    setFilters((prev) => prev.filter((f) => f.column.key !== columnKey));
  };

  const clearAllFilters = () => setFilters([]);

  return {
    data: processedData,
    sort,
    filters,
    toggleSort,
    applyFilter,
    clearFilter,
    clearAllFilters,
    columns,
  };
};