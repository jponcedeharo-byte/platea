'use client';

import { useState } from 'react';
import { useMiLista } from '@/lib/mi-lista-context';
import { getPeliculas } from '@/lib/data';
import type { Pelicula } from '@/lib/types';
import FilmCard from '@/components/FilmCard';
import FilmModal from '@/components/FilmModal';

export default function MiListaPage() {
  const { lista } = useMiLista();
  const [modalFilm, setModalFilm] = useState<Pelicula | null>(null);

  const todasPeliculas = getPeliculas();
  const peliculasEnLista = lista
    .map((slug) => todasPeliculas.find((p) => p.slug === slug))
    .filter((p): p is Pelicula => p !== undefined);

  return (
    <div className="mi-lista-page gut">
      <h1 className="mi-lista-titulo">Mi lista</h1>

      {peliculasEnLista.length === 0 ? (
        <p className="mi-lista-vacia">
          Tu lista está vacía. Pulsa + en cualquier película para guardarla aquí.
        </p>
      ) : (
        <div className="search-grid">
          {peliculasEnLista.map((film) => (
            <FilmCard key={film.id} film={film} onOpenModal={setModalFilm} />
          ))}
        </div>
      )}

      {modalFilm && (
        <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
      )}
    </div>
  );
}
