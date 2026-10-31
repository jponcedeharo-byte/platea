'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import type { Pelicula } from '@/lib/types';
import { getPeliculas } from '@/lib/data';
import { buscarPeliculas } from '@/lib/utils';
import FilmCard from '@/components/FilmCard';
import FilmModal from '@/components/FilmModal';

function BuscarInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') ?? '';

  const [q, setQ] = useState(initialQ);
  const [inputValue, setInputValue] = useState(initialQ);
  const [results, setResults] = useState<Pelicula[]>([]);
  const [modalFilm, setModalFilm] = useState<Pelicula | null>(null);

  useEffect(() => {
    const todas = getPeliculas();
    setResults(buscarPeliculas(todas, q));
  }, [q]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setQ(trimmed);
    if (trimmed) {
      router.replace(`/buscar?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.replace('/buscar');
    }
  }

  return (
    <div className="search-page gut">
      <form onSubmit={handleSubmit} className="search-page-form" role="search">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Buscar por título, director, año…"
          className="search-page-input"
          aria-label="Buscar en Platea"
          maxLength={120}
          autoFocus
        />
        <button type="submit" className="btn btn--primary">
          Buscar
        </button>
      </form>

      {q ? (
        <>
          <h1 className="search-results-title">
            {results.length > 0
              ? `${results.length} resultado${results.length !== 1 ? 's' : ''} para «${q}»`
              : `Sin resultados para «${q}»`}
          </h1>
          {results.length > 0 ? (
            <div className="search-grid">
              {results.map((film) => (
                <FilmCard key={film.id} film={film} onOpenModal={setModalFilm} />
              ))}
            </div>
          ) : (
            <p className="search-empty">
              No hay ninguna película con ese nombre todavía. Prueba con un director o un año,
              por ejemplo «Murnau» o «1922».
            </p>
          )}
        </>
      ) : (
        <p className="search-empty" style={{ color: 'var(--dim)' }}>
          Escribe un título, director o año para buscar.
        </p>
      )}

      {modalFilm && (
        <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="search-page gut" style={{ color: 'var(--muted)' }}>Cargando…</div>}>
      <BuscarInner />
    </Suspense>
  );
}
