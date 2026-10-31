import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPelicula, getPeliculas, getColecciones, getPatrocinadores } from '@/lib/data';
import { formatDuracion, ytThumb, duracionISO, derechosLabel } from '@/lib/utils';
import MiListaButton from '@/components/MiListaButton';
import GenArtCanvas from '@/components/GenArtCanvas';
import type { Coleccion } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPeliculas().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const film = getPelicula(slug);
  if (!film) return {};

  const thumbSrc = film.imagen_url ?? (film.youtube_id ? ytThumb(film.youtube_id, 'max') : undefined);

  return {
    title: `${film.titulo} (${film.anio}) · Ver gratis y legal`,
    description: film.sinopsis,
    openGraph: {
      title: `${film.titulo} (${film.anio})`,
      description: film.sinopsis,
      images: thumbSrc ? [{ url: thumbSrc, width: 1280, height: 720, alt: film.titulo }] : [],
      type: 'video.movie',
    },
  };
}

export default async function FichaPage({ params }: Props) {
  const { slug } = await params;
  const film = getPelicula(slug);
  if (!film) notFound();

  const colecciones: Coleccion[] = getColecciones();
  const filmColecciones = colecciones.filter((c) => film.colecciones.includes(c.slug));
  const patrocinadores = getPatrocinadores();
  const granEstreno = patrocinadores.find((p) => p.nivel === 'estreno');

  const thumbSrc = film.imagen_url ?? (film.youtube_id ? ytThumb(film.youtube_id, 'max') : null);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: film.titulo,
    alternateName: film.titulo_original,
    datePublished: String(film.anio),
    director: { '@type': 'Person', name: film.direccion },
    duration: duracionISO(film.duracion_min),
    description: film.sinopsis,
    image: thumbSrc ?? undefined,
    inLanguage: film.idioma === 'mudo' ? 'silent' : film.idioma,
    ...(film.youtube_id && {
      '@type': ['Movie', 'VideoObject'],
      embedUrl: `https://www.youtube-nocookie.com/embed/${film.youtube_id}`,
      thumbnailUrl: thumbSrc ?? undefined,
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="ficha-hero">
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={`Imagen de ${film.titulo}`}
            fill
            priority
            sizes="100vw"
            className="ficha-hero-img"
          />
        ) : (
          <GenArtCanvas film={film} className="ficha-gen-art" />
        )}
        <div className="ficha-hero-overlay" aria-hidden="true" />
        <div className="ficha-titulo-overlay gut">
          <h1 className="ficha-titulo">{film.titulo}</h1>
        </div>
      </div>

      {/* Cuerpo */}
      <article className="ficha-body gut">
        <div className="ficha-grid">
          {/* Columna principal */}
          <div>
            <div className="ficha-meta">
              <span className="mono">{film.anio}</span>
              <span aria-hidden="true">·</span>
              <span className="mono">{formatDuracion(film.duracion_min)}</span>
              {film.episodios && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="mono">{film.episodios} eps.</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{film.direccion}</span>
            </div>

            <p className="ficha-sinopsis">{film.sinopsis}</p>

            <div className="ficha-actions">
              {film.youtube_id && (
                <Link href={`/pelicula/${film.slug}/sala`} className="btn btn--primary btn--lg">
                  Ver ahora
                </Link>
              )}
              <MiListaButton slug={film.slug} titulo={film.titulo} variant="full" />
            </div>

            {/* Sala — aviso de patrocinador */}
            {granEstreno && film.youtube_id && (
              <p style={{ color: 'var(--dim)', fontSize: '.8125rem', marginTop: 8 }}>
                Esta sesión llega gracias a{' '}
                <span style={{ color: 'var(--lamp)' }}>{granEstreno.nombre_publico}</span>.
              </p>
            )}
          </div>

          {/* Columna lateral */}
          <aside className="ficha-aside">
            <dl className="ficha-dl">
              <dt>Dirección</dt>
              <dd>{film.direccion}</dd>

              {film.titulo_original && (
                <>
                  <dt>Título original</dt>
                  <dd>{film.titulo_original}</dd>
                </>
              )}

              {film.pais && (
                <>
                  <dt>País</dt>
                  <dd>{film.pais}</dd>
                </>
              )}

              {film.idioma && (
                <>
                  <dt>Idioma</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{film.idioma}</dd>
                </>
              )}

              {film.episodios && (
                <>
                  <dt>Episodios</dt>
                  <dd>{film.episodios}</dd>
                </>
              )}

              <dt>Derechos</dt>
              <dd>
                <span className={`badge badge--${film.derechos}`}>
                  {derechosLabel(film.derechos)}
                </span>
              </dd>

              {film.youtube_canal_nombre && (
                <>
                  <dt>Fuente</dt>
                  <dd className="muted">{film.youtube_canal_nombre}</dd>
                </>
              )}

              {filmColecciones.length > 0 && (
                <>
                  <dt>Colecciones</dt>
                  <dd>
                    <div className="ficha-colecciones">
                      {filmColecciones.map((c) => (
                        <Link
                          key={c.id}
                          href={`/coleccion/${c.slug}`}
                          className="ficha-col-chip"
                        >
                          {c.nombre}
                        </Link>
                      ))}
                    </div>
                  </dd>
                </>
              )}
            </dl>

            {/* Aviso de derechos */}
            <div id="derechos" className="ficha-derechos-aviso">
              <p>
                Si crees que este vídeo no debería estar aquí, puedes avisarnos y lo retiramos de inmediato mientras revisamos.
              </p>
              <Link
                href={`/pelicula/${film.slug}/aviso-derechos`}
                className="btn btn--sm"
                style={{ color: 'var(--velvet)', border: '1px solid rgba(178,58,72,.4)', background: 'transparent' }}
              >
                Avisar de un problema de derechos
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
