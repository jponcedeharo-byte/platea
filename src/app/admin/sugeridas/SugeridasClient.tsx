'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/* Tipos                                                                 */
/* ------------------------------------------------------------------ */
interface Sugerencia {
  id: string;
  youtube_id: string;
  titulo: string;
  youtube_canal_nombre: string;
  duracion_min: number | null;
  miniatura_url: string | null;
  licencia: 'creativeCommons' | 'youtube';
  origen: 'canal_confiable' | 'cc_search';
  creada_en: string;
}

/* ------------------------------------------------------------------ */
/* Helpers de estilo                                                     */
/* ------------------------------------------------------------------ */
const s = {
  // Layout
  page: {
    padding: '2rem 1.5rem 4rem',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: "'Schibsted Grotesk', sans-serif",
  } as React.CSSProperties,

  titulo: {
    fontFamily: "'Bodoni Moda', serif",
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  subtitulo: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    marginBottom: '2rem',
    fontFamily: "'Schibsted Grotesk', sans-serif",
  } as React.CSSProperties,

  // Cuadrícula
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  } as React.CSSProperties,

  // Tarjeta
  card: {
    background: 'var(--raised)',
    border: '1px solid var(--line)',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,

  // Miniatura
  thumbWrapper: {
    position: 'relative' as const,
    width: '100%',
    paddingTop: '56.25%', // 16:9
    background: 'var(--screen)',
    overflow: 'hidden',
  } as React.CSSProperties,

  thumbImg: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  } as React.CSSProperties,

  thumbPlaceholder: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--dim)',
    fontSize: '0.75rem',
    fontFamily: "'DM Mono', monospace",
  } as React.CSSProperties,

  // Cuerpo de la tarjeta
  body: {
    padding: '0.875rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
    flex: 1,
  } as React.CSSProperties,

  cardTitulo: {
    fontFamily: "'Bodoni Moda', serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.3,
    margin: 0,
  } as React.CSSProperties,

  canal: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.72rem',
    color: 'var(--muted)',
    letterSpacing: '0.01em',
  } as React.CSSProperties,

  duracion: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.72rem',
    color: 'var(--dim)',
  } as React.CSSProperties,

  // Badges
  badges: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.35rem',
    marginTop: '0.25rem',
  } as React.CSSProperties,

  badgeCC: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    background: 'color-mix(in srgb, var(--ok) 18%, transparent)',
    color: 'var(--ok)',
    border: '1px solid color-mix(in srgb, var(--ok) 35%, transparent)',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  badgeYT: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
    background: 'color-mix(in srgb, var(--lamp) 18%, transparent)',
    color: 'var(--lamp)',
    border: '1px solid color-mix(in srgb, var(--lamp) 35%, transparent)',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  badgeOrigen: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.68rem',
    fontFamily: "'DM Mono', monospace",
    background: 'var(--raised-2)',
    color: 'var(--muted)',
    border: '1px solid var(--line)',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  // Botones
  acciones: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0 1rem 1rem',
  } as React.CSSProperties,

  btnAprobar: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--raised-2)',
    color: 'var(--lamp)',
    fontFamily: "'Schibsted Grotesk', sans-serif",
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity .15s',
  } as React.CSSProperties,

  btnDescartar: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--velvet)',
    background: 'transparent',
    color: 'var(--velvet)',
    fontFamily: "'Schibsted Grotesk', sans-serif",
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity .15s',
  } as React.CSSProperties,

  // Estados
  vacio: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    padding: '3rem 0',
    textAlign: 'center' as const,
    fontFamily: "'Schibsted Grotesk', sans-serif",
  } as React.CSSProperties,

  error: {
    color: 'var(--velvet)',
    fontSize: '0.9rem',
    padding: '1.5rem',
    border: '1px solid color-mix(in srgb, var(--velvet) 30%, transparent)',
    borderRadius: '8px',
    background: 'color-mix(in srgb, var(--velvet) 8%, transparent)',
    fontFamily: "'Schibsted Grotesk', sans-serif",
  } as React.CSSProperties,
};

/* ------------------------------------------------------------------ */
/* Skeleton                                                              */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div style={{ ...s.card, opacity: 0.6 }}>
      <style>{`
        @keyframes platea-pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 0.25; }
        }
        .platea-pulse { animation: platea-pulse 1.4s ease-in-out infinite; }
      `}</style>
      <div
        className="platea-pulse"
        style={{ width: '100%', paddingTop: '56.25%', background: 'var(--raised-2)' }}
      />
      <div style={{ ...s.body, gap: '0.6rem' }}>
        <div
          className="platea-pulse"
          style={{ height: '1rem', width: '85%', borderRadius: '4px', background: 'var(--raised-2)' }}
        />
        <div
          className="platea-pulse"
          style={{ height: '0.75rem', width: '55%', borderRadius: '4px', background: 'var(--raised-2)' }}
        />
        <div
          className="platea-pulse"
          style={{ height: '0.75rem', width: '35%', borderRadius: '4px', background: 'var(--raised-2)' }}
        />
      </div>
      <div style={{ ...s.acciones, paddingTop: 0 }}>
        <div
          className="platea-pulse"
          style={{ flex: 1, height: '2rem', borderRadius: '6px', background: 'var(--raised-2)' }}
        />
        <div
          className="platea-pulse"
          style={{ flex: 1, height: '2rem', borderRadius: '6px', background: 'var(--raised-2)' }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */
export default function SugeridasClient() {
  const router = useRouter();
  const [lista, setLista] = useState<Sugerencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [descartando, setDescartando] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/admin/sugeridas', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelado) setErrorMsg(data.error ?? 'Error al cargar sugerencias.');
          return;
        }
        if (!cancelado) setLista(data.sugerencias ?? []);
      } catch {
        if (!cancelado) setErrorMsg('No se pudo conectar con el servidor.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    void cargar();
    return () => { cancelado = true; };
  }, []);

  async function descartar(id: string) {
    setDescartando(id);
    try {
      const res = await fetch('/api/admin/sugeridas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? 'Error al descartar.');
        return;
      }
      setLista((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setDescartando(null);
    }
  }

  function aprobar(youtube_id: string) {
    router.push(`/admin?youtube_id=${encodeURIComponent(youtube_id)}`);
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */
  return (
    <div style={s.page}>
      <h1 style={s.titulo}>Sugerencias del auto-descubridor</h1>
      <p style={s.subtitulo}>
        Vídeos encontrados automáticamente, pendientes de revisión humana antes de publicar.
      </p>

      {errorMsg && (
        <p style={s.error} role="alert">{errorMsg}</p>
      )}

      {cargando ? (
        <div style={s.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : lista.length === 0 && !errorMsg ? (
        <p style={s.vacio}>
          No hay sugerencias pendientes. El auto-descubridor corre cada lunes.
        </p>
      ) : (
        <div style={s.grid}>
          {lista.map((item) => (
            <article key={item.id} style={s.card}>
              {/* Miniatura */}
              <div style={s.thumbWrapper}>
                {item.miniatura_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.miniatura_url}
                    alt={item.titulo}
                    style={s.thumbImg}
                    loading="lazy"
                  />
                ) : (
                  <div style={s.thumbPlaceholder}>sin miniatura</div>
                )}
              </div>

              {/* Datos */}
              <div style={s.body}>
                <h2 style={s.cardTitulo}>{item.titulo}</h2>
                <span style={s.canal}>{item.youtube_canal_nombre}</span>
                {item.duracion_min != null && (
                  <span style={s.duracion}>{item.duracion_min} min</span>
                )}

                {/* Badges */}
                <div style={s.badges}>
                  {item.licencia === 'creativeCommons' ? (
                    <span style={s.badgeCC} title="Licencia Creative Commons">CC</span>
                  ) : (
                    <span style={s.badgeYT} title="Canal de YouTube estándar">Canal</span>
                  )}
                  <span style={s.badgeOrigen}>
                    {item.origen === 'canal_confiable' ? 'Canal verificado' : 'Licencia CC'}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div style={s.acciones}>
                <button
                  style={s.btnAprobar}
                  aria-label={`Aprobar ${item.titulo}`}
                  onClick={() => aprobar(item.youtube_id)}
                >
                  Aprobar →
                </button>
                <button
                  style={{
                    ...s.btnDescartar,
                    opacity: descartando === item.id ? 0.5 : 1,
                  }}
                  aria-label={`Descartar ${item.titulo}`}
                  disabled={descartando === item.id}
                  onClick={() => void descartar(item.id)}
                >
                  {descartando === item.id ? 'Descartando…' : 'Descartar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
