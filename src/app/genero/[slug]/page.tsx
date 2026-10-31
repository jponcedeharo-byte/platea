import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import FilmRow from '@/components/FilmRow';
import { getGenero, GENEROS } from '@/lib/genres';
import { getPeliculasPorGenero, getPatrocinadorPorGenero } from '@/lib/data';
import { getUnsplashPhoto } from '@/lib/unsplash';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GENEROS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genero = getGenero(slug);
  if (!genero) return {};
  return {
    title: genero.nombre,
    description: genero.descripcion,
  };
}

export default async function GeneroPage({ params }: Props) {
  const { slug } = await params;
  const genero = getGenero(slug);
  if (!genero) notFound();

  const films = getPeliculasPorGenero(slug);
  const sponsor = getPatrocinadorPorGenero(slug);
  const photo = await getUnsplashPhoto(genero.unsplashQuery);

  return (
    <>
      {/* Cabecera del género */}
      <header
        className="genre-hero"
        style={{ '--genre-gradient': genero.gradiente } as React.CSSProperties}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt={genero.nombre}
            fill
            priority
            sizes="100vw"
            className="genre-hero-img"
          />
        ) : null}
        <div className="genre-hero-vignette" aria-hidden="true" />
        <div className="genre-hero-content gut">
          <span className="genre-eyebrow">Género</span>
          <h1 className="genre-titulo">{genero.nombre}</h1>
          <p className="genre-desc">{genero.descripcion}</p>
          {sponsor && (
            <span className="genre-sponsor">
              Patrocinado por{' '}
              {sponsor.enlace_web ? (
                <a
                  href={sponsor.enlace_web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-link"
                >
                  <b>{sponsor.nombre_publico}</b>
                </a>
              ) : (
                <b>{sponsor.nombre_publico}</b>
              )}
            </span>
          )}
        </div>
        {photo && (
          <p className="genre-photo-credit">
            Foto:{' '}
            <a href={photo.authorUrl} target="_blank" rel="noopener noreferrer">
              {photo.author}
            </a>{' '}
            en Unsplash
          </p>
        )}
      </header>

      {/* Películas del género */}
      <div style={{ paddingBottom: 'clamp(24px, 4vw, 48px)' }}>
        {films.length > 0 ? (
          <FilmRow titulo={`Todo en ${genero.nombre}`} films={films} />
        ) : (
          <div className="genre-empty gut">
            <p>Aún no hay películas en este género. Próximamente.</p>
          </div>
        )}
      </div>
    </>
  );
}
