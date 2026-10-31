'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Pelicula, Patrocinador } from '@/lib/types';
import { ytThumb, formatDuracion } from '@/lib/utils';
import FilmModal from './FilmModal';
import GenArtCanvas from './GenArtCanvas';
import FilmActions from './FilmActions';

interface BillboardProps {
  films: Pelicula[];
  granEstreno?: Patrocinador;
}

const INTERVAL = 11000;

export default function Billboard({ films, granEstreno }: BillboardProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [modalFilm, setModalFilm] = useState<Pelicula | null>(null);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const film = films[idx];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % films.length);
    setImgError(false);
  }, [films.length]);

  useEffect(() => {
    if (films.length <= 1 || paused || reducedMotion) return;
    timerRef.current = setInterval(next, INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [films.length, paused, reducedMotion, next]);

  if (!film) return null;

  const thumbSrc = film.imagen_url
    ? film.imagen_url
    : film.youtube_id
    ? ytThumb(film.youtube_id, 'max')
    : null;

  // Tile grid 3×3: letras del título + dígitos del año + símbolo
  const tileLetters = film.titulo
    .replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, '·')
    .split('');
  const yearStr = String(film.anio);
  // 9 tiles: L0 L1 L2 | Y0 Y1 Y2 | Y3 ✓ !
  // el tile central (índice 4 = Y1) es el acento ámbar
  const tiles = [
    { char: tileLetters[0], accent: false, dim: false },
    { char: tileLetters[1], accent: false, dim: false },
    { char: tileLetters[2], accent: false, dim: false },
    { char: yearStr[0] ?? '·', accent: false, dim: true },
    { char: yearStr[1] ?? '·', accent: true,  dim: false },
    { char: yearStr[2] ?? '·', accent: false, dim: true },
    { char: yearStr[3] ?? '·', accent: false, dim: false },
    { char: '✓',               accent: false, dim: true  },
    { char: '!',               accent: false, dim: true  },
  ];

  return (
    <section
      className="billboard"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Película destacada"
      data-paused={paused ? 'true' : 'false'}
    >
      {/* Imagen de fondo */}
      <div className="billboard-bg" aria-hidden="true">
        {thumbSrc && !imgError ? (
          <Image
            src={thumbSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="billboard-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <GenArtCanvas film={film} className="billboard-gen-art" />
        )}
        <div className="billboard-vignette" />
      </div>

      {/* Layout interior */}
      <div className="billboard-inner gut">

        {/* Slide wrapper — fade + lift al cambiar película */}
        <div className="billboard-slide" key={idx}>

        {/* Contenido de texto */}
        <div className="billboard-content">
          {/* Eyebrow + etiquetas */}
          <div className="billboard-labels">
            <span className="billboard-tag">Destacada</span>
            {granEstreno ? (
              <span className="billboard-sponsor">
                Presentada por{' '}
                {granEstreno.enlace_web ? (
                  <a href={granEstreno.enlace_web} target="_blank" rel="noopener noreferrer" className="sponsor-link">
                    <b>{granEstreno.nombre_publico}</b>
                  </a>
                ) : (
                  <b>{granEstreno.nombre_publico}</b>
                )}
              </span>
            ) : (
              <span className="billboard-eyebrow">Selección de la semana</span>
            )}
          </div>

          {/* Título */}
          <h1 className="billboard-titulo">{film.titulo}</h1>

          {/* Metadatos */}
          <div className="billboard-meta">
            <span className="mono">{film.anio}</span>
            <span aria-hidden="true">·</span>
            <span className="mono">{formatDuracion(film.duracion_min)}</span>
            <span aria-hidden="true">·</span>
            <span>{film.direccion}</span>
          </div>

          {/* Sinopsis */}
          <p className="billboard-sinopsis">{film.sinopsis}</p>

          {/* Botones */}
          <div className="billboard-actions">
            {film.youtube_id && (
              <Link href={`/pelicula/${film.slug}/sala`} className="btn btn--primary btn--lg">
                ▶ Ver ahora
              </Link>
            )}
            <button
              className="btn btn--ghost btn--lg"
              onClick={() => setModalFilm(film)}
            >
              Más información
            </button>
          </div>
          <FilmActions film={film} size="sm" />
        </div>

        </div>{/* /.billboard-slide */}

        {/* Tile grid */}
        <div className="billboard-tiles" aria-hidden="true">
          {tiles.map((t, i) => (
            <div
              key={i}
              className={`film-tile${t.accent ? ' film-tile--accent' : ''}${t.dim ? ' film-tile--dim' : ''}`}
            >
              {t.char}
            </div>
          ))}
        </div>

      </div>{/* /.billboard-inner */}

      {/* Indicadores de posición */}
      {films.length > 1 && (
        <div className="billboard-dots" role="tablist" aria-label="Películas destacadas">
          {films.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={i === idx}
              aria-current={i === idx ? 'true' : undefined}
              aria-label={`Ver ${f.titulo}`}
              className={`billboard-dot${i === idx ? ' active' : ''}`}
              data-active={i === idx}
              onClick={() => {
                setIdx(i);
                setImgError(false);
              }}
            />
          ))}
        </div>
      )}

      {modalFilm && (
        <FilmModal film={modalFilm} onClose={() => setModalFilm(null)} />
      )}
    </section>
  );
}
