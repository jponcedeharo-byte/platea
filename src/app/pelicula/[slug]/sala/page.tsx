'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPelicula, getGranEstreno } from '@/lib/data';
import { ytEmbedUrl, formatDuracion } from '@/lib/utils';
import GenArtCanvas from '@/components/GenArtCanvas';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function SalaPage({ params }: Props) {
  const { slug } = use(params);
  const film = getPelicula(slug);

  if (!film) notFound();

  const granEstreno = getGranEstreno();
  const [sponsorSkipped, setSponsorSkipped] = useState(false);
  const [playerStarted, setPlayerStarted] = useState(false);

  const showSponsor = granEstreno && !sponsorSkipped && !playerStarted;

  return (
    <div className="sala">
      {/* Cabecera de sala */}
      <div className="sala-header">
        <Link href={`/pelicula/${film.slug}`} className="sala-back">
          <span aria-hidden="true">←</span>
          <span>{film.titulo}</span>
        </Link>
        <span className="mono" style={{ color: 'var(--dim)', fontSize: '11px' }}>
          {film.anio} · {formatDuracion(film.duracion_min)}
        </span>
      </div>

      {/* Cartela del patrocinador */}
      {granEstreno && !sponsorSkipped && (
        <div className="sala-sponsor-strip">
          <p className="sala-sponsor-text">
            Esta sesión llega gracias a{' '}
            <span className="sala-sponsor-name">
              {granEstreno.enlace_web ? (
                <a
                  href={granEstreno.enlace_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit' }}
                >
                  {granEstreno.nombre_publico}
                </a>
              ) : (
                granEstreno.nombre_publico
              )}
            </span>
          </p>
          <button
            className="sala-skip"
            onClick={() => setSponsorSkipped(true)}
            aria-label="Saltar cartela del patrocinador"
          >
            Saltar
          </button>
        </div>
      )}

      {/* Reproductor */}
      <div className="sala-player-wrap">
        {film.youtube_id ? (
          sponsorSkipped || !granEstreno ? (
            <iframe
              className="sala-iframe"
              src={ytEmbedUrl(film.youtube_id)}
              title={`Reproducir ${film.titulo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setPlayerStarted(true)}
            />
          ) : (
            /* Mientras se muestra el patrocinador, mostrar la miniatura sin autoplay */
            <div
              className="sala-player-placeholder"
              style={{ cursor: 'pointer' }}
              onClick={() => setSponsorSkipped(true)}
              role="button"
              aria-label="Saltar al reproductor"
            >
              <GenArtCanvas film={film} />
              <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
                Haz clic para empezar
              </p>
            </div>
          )
        ) : (
          <div className="sala-player-placeholder">
            <GenArtCanvas film={film} />
            <p style={{ fontSize: '1rem', marginTop: 16 }}>
              {film.titulo}
            </p>
            <p style={{ fontSize: '.875rem', color: 'var(--dim)' }}>
              Este vídeo aún no está disponible en Platea.
            </p>
          </div>
        )}
      </div>

      {/* Nota legal sobre el patrocinador */}
      {granEstreno && (
        <p className="sala-legal">
          El patrocinador aparece en la sala, nunca dentro del vídeo.
        </p>
      )}
    </div>
  );
}
