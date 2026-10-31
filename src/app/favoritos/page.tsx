'use client';

import { useFavoritos } from '@/lib/favoritos-context';
import { getPeliculas } from '@/lib/data';
import FilmCard from '@/components/FilmCard';
import FilmModal from '@/components/FilmModal';
import { useState } from 'react';
import type { Pelicula } from '@/lib/types';

export default function FavoritosPage() {
  const { favoritos } = useFavoritos();
  const [modalFilm, setModalFilm] = useState<Pelicula | null>(null);

  const todas = getPeliculas();
  const films = todas.filter((p) => favoritos.includes(p.slug));

  return (
    <div className="mi-lista-page gut">
      <header className="mi-lista-header">
        <span className="row-eyebrow">Tu selección</span>
        <h1 className="mi-lista-titulo">Favoritos</h1>
      </header>

      {films.length === 0 ? (
        <p className="mi-lista-vacia">
          Aún no tienes favoritos. Pulsa el corazón ♡ en cualquier película para añadirla.
        </p>
      ) : (
        <div className="mi-lista-grid">
          {films.map((film) => (
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
