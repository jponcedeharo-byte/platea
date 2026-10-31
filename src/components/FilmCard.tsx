'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Pelicula } from '@/lib/types';
import { ytThumb, formatDuracion } from '@/lib/utils';
import { useMiLista } from '@/lib/mi-lista-context';
import GenArtCanvas from './GenArtCanvas';

interface FilmCardProps {
  film: Pelicula;
  onOpenModal?: (film: Pelicula) => void;
}

export default function FilmCard({ film, onOpenModal }: FilmCardProps) {
  const { estaEnLista } = useMiLista();
  const enLista = estaEnLista(film.slug);
  const [imgError, setImgError] = useState(false);

  const thumbSrc = film.imagen_url
    ? film.imagen_url
    : film.youtube_id
    ? ytThumb(film.youtube_id, 'max')
    : null;

  return (
    <article
      className="film-card"
      onClick={() => onOpenModal?.(film)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal?.(film);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Ver información de ${film.titulo}`}
    >
      {/* Imagen / arte generativo */}
      <div className="card-art">
        {thumbSrc && !imgError ? (
          <Image
            src={thumbSrc}
            alt={`Miniatura de ${film.titulo}`}
            fill
            sizes="(max-width: 640px) 52vw, (max-width: 1024px) 22vw, 220px"
            className="card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <GenArtCanvas
            film={film}
            className="card-gen-art"
          />
        )}

        {/* Indicador Mi lista */}
        {enLista && (
          <span className="card-en-lista" aria-label="En tu lista">✓</span>
        )}

        {/* Overlay de hover — play + duración + director */}
        <div className="card-hover-overlay" aria-hidden="true">
          <span className="card-play-icon" />
          {film.duracion_min > 0 && (
            <span className="card-overlay-duracion">
              {formatDuracion(film.duracion_min)}
            </span>
          )}
          {film.direccion && (
            <span className="card-overlay-director">{film.direccion}</span>
          )}
        </div>
      </div>

      {/* Cuerpo: título + tags */}
      <div className="card-body">
        <h3 className="card-titulo">{film.titulo}</h3>
        <div className="card-tags">
          <span className="card-tag card-tag--year">{film.anio}</span>
          {film.derechos === 'dominio_publico_ue' && (
            <span className="card-tag card-tag--rights">D. Público</span>
          )}
          {film.episodios && (
            <span className="card-tag">{film.episodios} eps.</span>
          )}
        </div>
      </div>
    </article>
  );
}
