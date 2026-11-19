import { createContext, useContext, type ReactNode } from "react";
import { useStoredState } from "@/hooks/useStoredState";
import { isFavoriteList, type Favorite } from "@/types/fipe";
const EMPTY: Favorite[] = [];
function useFavoritesState() {
  const storage = useStoredState(
    "fipecheck_favorites_v1",
    EMPTY,
    isFavoriteList,
  );
  return {
    ...storage,
    favorites: storage.value,
    add: (favorite: Favorite) =>
      storage.save([
        ...storage.value.filter((item) => item.id !== favorite.id),
        favorite,
      ]),
    remove: (id: string) =>
      storage.save(storage.value.filter((item) => item.id !== id)),
  };
}
const FavoritesContext = createContext<ReturnType<
  typeof useFavoritesState
> | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  return (
    <FavoritesContext.Provider value={useFavoritesState()}>
      {children}
    </FavoritesContext.Provider>
  );
}
export function useFavorites() {
  const state = useContext(FavoritesContext);
  if (!state) throw new Error("FavoritesProvider ausente");
  return state;
}
