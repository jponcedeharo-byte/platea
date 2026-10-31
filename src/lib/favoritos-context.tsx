'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FavoritosContextValue {
  esFavorito: (slug: string) => boolean;
  toggleFavorito: (slug: string) => void;
  favoritos: string[];
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null);
const STORAGE_KEY = 'platea-favoritos-v1';

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavoritos(JSON.parse(raw));
    } catch {
      // localStorage no disponible
    }
  }, []);

  const toggleFavorito = useCallback((slug: string) => {
    setFavoritos((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // no-op
      }
      return next;
    });
  }, []);

  const esFavorito = useCallback((slug: string) => favoritos.includes(slug), [favoritos]);

  return (
    <FavoritosContext.Provider value={{ esFavorito, toggleFavorito, favoritos }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error('useFavoritos debe usarse dentro de FavoritosProvider');
  return ctx;
}
