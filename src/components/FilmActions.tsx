'use client';

import { useMiLista } from '@/lib/mi-lista-context';
import { useVotos } from '@/lib/votes-context';
import { useFavoritos } from '@/lib/favoritos-context';
import type { Pelicula } from '@/lib/types';

interface FilmActionsProps {
  film: Pelicula;
  size?: 'sm' | 'md';
}

export default function FilmActions({ film, size = 'md' }: FilmActionsProps) {
  const { toggle: toggleLista, estaEnLista } = useMiLista();
  const { getVoto, votar } = useVotos();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const enLista = estaEnLista(film.slug);
  const voto = getVoto(film.slug);
  const favorito = esFavorito(film.slug);

  const cls = size === 'sm' ? 'film-actions film-actions--sm' : 'film-actions';

  return (
    <div className={cls} role="group" aria-label={`Acciones para ${film.titulo}`}>
      {/* Mi lista */}
      <button
        className={`action-btn${enLista ? ' action-btn--active' : ''}`}
        onClick={() => toggleLista(film.slug)}
        aria-pressed={enLista}
        aria-label={enLista ? `Quitar de Mi lista` : `Añadir a Mi lista`}
        title={enLista ? 'Quitar de Mi lista' : 'Añadir a Mi lista'}
      >
        <span className="action-icon" aria-hidden="true">{enLista ? '✓' : '+'}</span>
        <span className="action-label">{enLista ? 'En lista' : 'Mi lista'}</span>
      </button>

      {/* Favorito */}
      <button
        className={`action-btn action-btn--heart${favorito ? ' action-btn--active' : ''}`}
        onClick={() => toggleFavorito(film.slug)}
        aria-pressed={favorito}
        aria-label={favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
        title={favorito ? 'Quitar de favoritos' : 'Favorito'}
      >
        <span className="action-icon" aria-hidden="true">{favorito ? '♥' : '♡'}</span>
        <span className="action-label">Favorito</span>
      </button>

      {/* Pulgar arriba */}
      <button
        className={`action-btn action-btn--up${voto === 'up' ? ' action-btn--active' : ''}`}
        onClick={() => votar(film.slug, 'up')}
        aria-pressed={voto === 'up'}
        aria-label="Me gusta"
        title="Me gusta"
      >
        <span className="action-icon" aria-hidden="true">👍</span>
        <span className="action-label">Me gusta</span>
      </button>

      {/* Pulgar abajo */}
      <button
        className={`action-btn action-btn--down${voto === 'down' ? ' action-btn--active' : ''}`}
        onClick={() => votar(film.slug, 'down')}
        aria-pressed={voto === 'down'}
        aria-label="No me gusta"
        title="No me gusta"
      >
        <span className="action-icon" aria-hidden="true">👎</span>
        <span className="action-label">No me gusta</span>
      </button>
    </div>
  );
}
