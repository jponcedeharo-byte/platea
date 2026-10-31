'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Voto = 'up' | 'down' | null;
type VotosMap = Record<string, Voto>;

interface VotosContextValue {
  getVoto: (slug: string) => Voto;
  votar: (slug: string, voto: Voto) => void;
}

const VotosContext = createContext<VotosContextValue | null>(null);
const STORAGE_KEY = 'platea-votos-v1';

export function VotosProvider({ children }: { children: React.ReactNode }) {
  const [votos, setVotos] = useState<VotosMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVotos(JSON.parse(raw));
    } catch {
      // localStorage no disponible
    }
  }, []);

  const votar = useCallback((slug: string, voto: Voto) => {
    setVotos((prev) => {
      const next = { ...prev };
      // Si vota lo mismo que ya votó, quita el voto
      if (next[slug] === voto) {
        delete next[slug];
      } else if (voto === null) {
        delete next[slug];
      } else {
        next[slug] = voto;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // no-op
      }
      return next;
    });
  }, []);

  const getVoto = useCallback((slug: string): Voto => votos[slug] ?? null, [votos]);

  return (
    <VotosContext.Provider value={{ getVoto, votar }}>
      {children}
    </VotosContext.Provider>
  );
}

export function useVotos(): VotosContextValue {
  const ctx = useContext(VotosContext);
  if (!ctx) throw new Error('useVotos debe usarse dentro de VotosProvider');
  return ctx;
}
