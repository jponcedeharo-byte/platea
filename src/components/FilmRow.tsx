'use client';

import { useRef } from 'react';
import type { Pelicula } from '@/lib/types';
import type { Patrocinador } from '@/lib/types';
import FilmCard from './FilmCard';
import FilmModal from './FilmModal';
import { useState } from 'react';

interface FilmRowProps {
  titulo: string;
  films: Pelicula[];
  patrocinador?: Patrocinador;
}

export default function FilmRow({ titulo, films, patrocinador }: FilmRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modalFilm, setModalFilm] = useState<Pelicula | null>(null);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -680, behavior: 'smooth' });
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 680, behavior: 'smooth' });
  }

  if (films.length === 0) return null;

  return (
    <section className="film-row" aria-label={titulo}>
      <div className="row-header gut">
        <div className="row-header-left">
          <span className="row-eyebrow">Colección · {films.length} {films.length === 1 ? 'película' : 'películas'}</span>
          <h2 className="row-titulo">{titulo}</h2>
        </div>
        {patrocinador && (
          <span className="row-sponsor">
            Presentada por{' '}
            {patrocinador.enlace_web ? (
              <a
                href={patrocinador.enlace_web}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-link"
                onClick={(e) => e.stopPropagation()}
              >
                <b>{patrocinador.nombre_publico}</b>
              </a>
            ) : (
              <b>{patrocinador.nombre_publico}</b>
            )}
          </span>
        )}
      </div>

      <div className="row-scroller-wrap">
        <button
          className="row-arrow row-arrow--left"
          onClick={scrollLeft}
          aria-label={`Desplazar ${titulo} hacia la izquierda`}
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="row-scroller"
          role="list"
          aria-label={`Películas de ${titulo}`}
        >
          {films.map((film) => (
            <div key={film.id} role="listitem">
              <FilmCard film={film} onOpenModal={setModalFilm} />
            </div>
          ))}
        </div>
        <button
          className="row-arrow row-arrow--right"
          onClick={scrollRight}
          aria-label={`Desplazar ${titulo} hacia la derecha`}
        >
          ›
        </button>
      </div>

      {modalFilm && (
        <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
      )}
    </section>
  );
}
