import { createContext, useContext, type ReactNode } from 'react';
import { useStoredState } from '@/hooks/useStoredState';
import type { Favorite } from '@/types/fipe';
const EMPTY: Favorite[] = [];
function validFavorites(data: unknown): data is Favorite[] {
  return Array.isArray(data) && data.every(item => item && typeof item.id === 'string' && item.query && ['carros', 'motos', 'caminhoes'].includes(item.query.type) && ['brand', 'model', 'year'].every(key => typeof item.query[key] === 'string') && item.details && typeof item.details.valor === 'string' && typeof item.details.modelo === 'string' && typeof item.details.mesReferencia === 'string');
}
function useFavoritesState() {
  const storage = useStoredState('fipecheck_favorites_v1', EMPTY, validFavorites);
  return { ...storage, favorites: storage.value, add: (favorite: Favorite) => storage.save([...storage.value.filter(item => item.id !== favorite.id), favorite]), remove: (id: string) => storage.save(storage.value.filter(item => item.id !== id)) };
}
const FavoritesContext = createContext<ReturnType<typeof useFavoritesState> | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) { return <FavoritesContext.Provider value={useFavoritesState()}>{children}</FavoritesContext.Provider>; }
export function useFavorites() { const state = useContext(FavoritesContext); if (!state) throw new Error('FavoritesProvider ausente'); return state; }
