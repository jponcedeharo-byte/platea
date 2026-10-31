'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const KEY = 'platea-lista-v1';

interface MiListaContextValue {
  lista: string[];
  toggle: (slug: string) => void;
  estaEnLista: (slug: string) => boolean;
}

const MiListaContext = createContext<MiListaContextValue | null>(null);

export function MiListaProvider({ children }: { children: React.ReactNode }) {
  const [lista, setLista] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          setLista(parsed as string[]);
        }
      }
    } catch {
      // localStorage no disponible o JSON inválido
    }
  }, []);

  const toggle = useCallback((slug: string) => {
    setLista((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignorar
      }
      return next;
    });
  }, []);

  const estaEnLista = useCallback((slug: string) => lista.includes(slug), [lista]);

  return (
    <MiListaContext.Provider value={{ lista, toggle, estaEnLista }}>
      {children}
    </MiListaContext.Provider>
  );
}

export function useMiLista(): MiListaContextValue {
  const ctx = useContext(MiListaContext);
  if (!ctx) throw new Error('useMiLista debe usarse dentro de MiListaProvider');
  return ctx;
}
