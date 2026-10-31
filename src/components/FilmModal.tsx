'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Pelicula } from '@/lib/types';
import { ytThumb, formatDuracion, derechosLabel } from '@/lib/utils';
import { useMiLista } from '@/lib/mi-lista-context';
import GenArtCanvas from './GenArtCanvas';
import FilmActions from './FilmActions';

interface FilmModalProps {
  film: Pelicula;
  onClose: () => void;
}

export default function FilmModal({ film, onClose }: FilmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { estaEnLista } = useMiLista();
  const enLista = estaEnLista(film.slug);
  const [imgError, setImgError] = useState(false);

  const thumbSrc = film.imagen_url
    ? film.imagen_url
    : film.youtube_id
    ? ytThumb(film.youtube_id, 'hq')
    : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="film-modal"
      onClick={handleBackdropClick}
      aria-label={`Información sobre ${film.titulo}`}
    >
      <div className="modal-inner">
        {/* Cabecera visual */}
        <div className="modal-art">
          {thumbSrc && !imgError ? (
            <Image
              src={thumbSrc}
              alt={`Imagen de ${film.titulo}`}
              fill
              sizes="(max-width: 768px) 100vw, 860px"
              className="modal-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <GenArtCanvas film={film} className="modal-gen-art" />
          )}
          <div className="modal-art-overlay" aria-hidden="true" />
          <div className="modal-art-title">
            <h2 className="modal-titulo">{film.titulo}</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
            autoFocus
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-body">
          <div className="modal-main">
            {/* Metadatos como chips individuales */}
            <div className="modal-meta">
              <span className="modal-meta-chip">{film.anio}</span>
              <span className="modal-meta-chip">{formatDuracion(film.duracion_min)}</span>
              {film.episodios && (
                <span className="modal-meta-chip">{film.episodios} episodios</span>
              )}
            </div>

            {/* Sinopsis */}
            <p className="modal-sinopsis">{film.sinopsis}</p>

            {/* Botones principales */}
            <div className="modal-actions">
              {film.youtube_id && (
                <Link
                  href={`/pelicula/${film.slug}/sala`}
                  className="btn btn--primary"
                  onClick={onClose}
                >
                  Ver ahora
                </Link>
              )}
              <Link
                href={`/pelicula/${film.slug}`}
                className="btn btn--ghost"
                onClick={onClose}
              >
                Más información
              </Link>
            </div>
            {/* Votos, favoritos y lista */}
            <FilmActions film={film} />
          </div>

          {/* Columna lateral */}
          <aside className="modal-aside">
            <dl className="modal-dl">
              <dt className="modal-dt">Dirección</dt>
              <dd className="modal-dd">{film.direccion}</dd>

              {film.titulo_original && (
                <>
                  <dt className="modal-dt">Título original</dt>
                  <dd className="modal-dd">{film.titulo_original}</dd>
                </>
              )}

              {film.pais && (
                <>
                  <dt className="modal-dt">País</dt>
                  <dd className="modal-dd">{film.pais}</dd>
                </>
              )}

              {film.idioma && (
                <>
                  <dt className="modal-dt">Idioma</dt>
                  <dd className="modal-dd" style={{ textTransform: 'capitalize' }}>{film.idioma}</dd>
                </>
              )}

              <dt className="modal-dt">Derechos</dt>
              <dd className="modal-dd">
                <span className={`badge badge--${film.derechos}`}>
                  {derechosLabel(film.derechos)}
                </span>
              </dd>

              {film.derechos_justificacion && (
                <>
                  <dt className="modal-dt">Justificación</dt>
                  <dd className="modal-dd">{film.derechos_justificacion}</dd>
                </>
              )}

              {film.youtube_canal_nombre && (
                <>
                  <dt className="modal-dt">Fuente</dt>
                  <dd className="modal-dd">{film.youtube_canal_nombre}</dd>
                </>
              )}
            </dl>

            {/* Aviso de derechos */}
            <Link
              href={`/pelicula/${film.slug}#derechos`}
              className="modal-rights-link"
              onClick={onClose}
            >
              ¿Problema de derechos? Avisar para retirarla
            </Link>
          </aside>
        </div>
      </div>
    </dialog>
  );
}
