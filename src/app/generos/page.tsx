import type { Metadata } from 'next';
import Link from 'next/link';
import { GENEROS } from '@/lib/genres';
import { getPeliculasPorGenero } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Géneros',
  description: 'Explora el cine clásico por género: terror, drama, documental, comedia y mucho más.',
};

export default function GenerosPage() {
  return (
    <div className="generos-page gut">
      <header className="generos-header">
        <span className="row-eyebrow">Explorar</span>
        <h1 className="generos-titulo">Géneros</h1>
        <span className="generos-titulo-linea" aria-hidden="true" />
        <p className="generos-desc">
          El cine clásico organizado por géneros. De los pioneros del terror a los documentalistas más atrevidos.
        </p>
      </header>

      <div className="generos-grid" role="list">
        {GENEROS.map((genero, index) => {
          const count = getPeliculasPorGenero(genero.slug).length;
          return (
            <Link
              key={genero.slug}
              href={`/genero/${genero.slug}`}
              className="genre-card"
              role="listitem"
              style={
                {
                  '--genre-gradient': genero.gradiente,
                  '--genre-acento': genero.acento,
                  '--delay': `${index * 40}ms`,
                } as React.CSSProperties
              }
            >
              <div className="genre-card-bg" aria-hidden="true">
                <div className="genre-card-perforado" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="genre-card-body">
                <h2 className="genre-card-nombre">{genero.nombre}</h2>
                <p className="genre-card-desc">{genero.descripcion}</p>
                <span className="genre-card-count">
                  {count} {count === 1 ? 'película' : 'películas'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
