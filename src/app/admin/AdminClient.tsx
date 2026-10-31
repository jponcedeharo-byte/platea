'use client';

import { useState } from 'react';
import Image from 'next/image';

interface TmdbResult {
  tmdb_id: number;
  titulo: string;
  titulo_original: string;
  anio: number | null;
  sinopsis: string;
  pais: string;
  idioma: string;
  duracion_min: number | null;
  poster: string | null;
}

interface FilmDraft {
  titulo: string;
  titulo_original: string;
  anio: number;
  sinopsis: string;
  pais: string;
  idioma: string;
  duracion_min: number;
  youtube_id: string;
  derechos_justificacion: string;
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? '';

export default function AdminClient() {
  const [password, setPassword] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<TmdbResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBuscar, setErrorBuscar] = useState('');

  const [draft, setDraft] = useState<FilmDraft | null>(null);
  const [copiado, setCopiado] = useState(false);

  function autenticar() {
    // Protección de panfleto: solo para uso en local antes de implementar auth real
    const secret = process.env.NEXT_PUBLIC_ADMIN_KEY ?? 'platea-admin';
    if (password === secret) {
      setAutenticado(true);
      setErrorAuth('');
    } else {
      setErrorAuth('Contraseña incorrecta.');
    }
  }

  async function buscar() {
    if (query.trim().length < 2) return;
    setBuscando(true);
    setErrorBuscar('');
    setResultados([]);
    try {
      const res = await fetch(`/api/admin/buscar?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorBuscar(data.error ?? 'Error buscando.');
        return;
      }
      setResultados(data.results ?? []);
    } catch {
      setErrorBuscar('No se pudo conectar con el servidor.');
    } finally {
      setBuscando(false);
    }
  }

  function seleccionarResultado(r: TmdbResult) {
    setDraft({
      titulo: r.titulo,
      titulo_original: r.titulo_original,
      anio: r.anio ?? new Date().getFullYear(),
      sinopsis: r.sinopsis,
      pais: r.pais,
      idioma: r.idioma,
      duracion_min: r.duracion_min ?? 0,
      youtube_id: '',
      derechos_justificacion: '',
    });
    setResultados([]);
  }

  function generarCodigo(): string {
    if (!draft) return '';
    const slug = draft.titulo
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40);
    return `{
  id: 'film-${slug}',
  slug: '${slug}-${draft.anio}',
  titulo: '${draft.titulo}',
  titulo_original: '${draft.titulo_original}',
  anio: ${draft.anio},
  direccion: 'POR COMPLETAR',
  duracion_min: ${draft.duracion_min},
  sinopsis: \`${draft.sinopsis.replace(/`/g, "'")}\`,
  pais: '${draft.pais}',
  idioma: '${draft.idioma}',
  youtube_id: '${draft.youtube_id}',   // ← VERIFICAR antes de publicar
  youtube_canal_nombre: 'POR COMPLETAR',
  motif: 'sombra',
  paleta: ['#0b0b0b', '#1f1f1f', '#f5f3ee', 'rgba(240,180,76,.4)'],
  derechos: 'dominio_publico_ue',
  derechos_justificacion: '${draft.derechos_justificacion}',
  publicada: false,   // ← cambiar a true SOLO tras verificar youtube_id
  colecciones: [],
  generos: [],
}`;
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(generarCodigo());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // no-op
    }
  }

  if (!autenticado) {
    return (
      <div className="admin-login gut">
        <h1 className="admin-titulo">Panel de administración</h1>
        <p className="muted">Este panel es solo para uso interno.</p>
        <div className="admin-form">
          <label htmlFor="admin-pass" className="admin-label">Contraseña</label>
          <input
            id="admin-pass"
            type="password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') autenticar(); }}
            autoComplete="current-password"
          />
          {errorAuth && <p className="admin-error" role="alert">{errorAuth}</p>}
          <button className="btn btn--primary" onClick={autenticar}>
            Entrar
          </button>
        </div>
        <p className="admin-nota muted">
          Configura <code>NEXT_PUBLIC_ADMIN_KEY</code> en .env.local con tu contraseña.
          El valor por defecto es <code>platea-admin</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-panel gut">
      <h1 className="admin-titulo">Panel de administración</h1>

      <section className="admin-section">
        <h2 className="admin-section-titulo">Buscar película por título</h2>
        <p className="muted">
          Busca en TMDB para autorellenar los metadatos. Tú introduces el YouTube ID
          manualmente tras verificar que el vídeo es legal y está disponible.
        </p>

        <div className="admin-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Título de la película…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') buscar(); }}
            aria-label="Buscar película"
          />
          <button
            className="btn btn--primary"
            onClick={buscar}
            disabled={buscando}
          >
            {buscando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>

        {errorBuscar && <p className="admin-error" role="alert">{errorBuscar}</p>}

        {resultados.length > 0 && (
          <ul className="admin-resultados">
            {resultados.map((r) => (
              <li key={r.tmdb_id} className="admin-resultado">
                {r.poster && (
                  <Image
                    src={r.poster}
                    alt={r.titulo}
                    width={60}
                    height={90}
                    className="admin-poster"
                  />
                )}
                <div className="admin-resultado-info">
                  <strong>{r.titulo}</strong>
                  {r.titulo_original !== r.titulo && (
                    <span className="muted"> ({r.titulo_original})</span>
                  )}
                  <span className="muted"> · {r.anio ?? '—'} · {r.pais}</span>
                  <p className="admin-resultado-sinopsis muted">{r.sinopsis?.slice(0, 120)}…</p>
                </div>
                <button
                  className="btn btn--ghost"
                  onClick={() => seleccionarResultado(r)}
                >
                  Usar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {draft && (
        <section className="admin-section">
          <h2 className="admin-section-titulo">Completar datos</h2>

          <div className="admin-draft-form">
            <div className="admin-field">
              <label className="admin-label">YouTube ID <span className="admin-required">*</span></label>
              <input
                type="text"
                className="admin-input"
                placeholder="p. ej. WcEPpMFfaE0"
                value={draft.youtube_id}
                onChange={(e) => setDraft({ ...draft, youtube_id: e.target.value })}
              />
              <p className="admin-help muted">
                Ve a YouTube, busca una copia legal (canal oficial o dominio público verificado),
                copia el ID del vídeo (la parte tras <code>?v=</code>) y pégalo aquí.
                <strong> No publiques sin verificar que el vídeo existe y es legal.</strong>
              </p>
            </div>

            <div className="admin-field">
              <label className="admin-label">Justificación de derechos</label>
              <input
                type="text"
                className="admin-input"
                placeholder="p. ej. Director (†1931). Dominio público en la UE."
                value={draft.derechos_justificacion}
                onChange={(e) => setDraft({ ...draft, derechos_justificacion: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Sinopsis (editable)</label>
              <textarea
                className="admin-input admin-textarea"
                value={draft.sinopsis}
                onChange={(e) => setDraft({ ...draft, sinopsis: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="admin-codigo-wrap">
            <div className="admin-codigo-header">
              <h3>Fragmento para seed-data.ts</h3>
              <button className="btn btn--ghost" onClick={copiarCodigo}>
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="admin-codigo">
              <code>{generarCodigo()}</code>
            </pre>
            <p className="admin-help muted">
              Copia este fragmento, pégalo en <code>src/lib/seed-data.ts</code> dentro
              del array <code>PELICULAS</code>, completa los campos marcados con{' '}
              <code>POR COMPLETAR</code> y cambia <code>publicada: false</code> a{' '}
              <code>publicada: true</code> solo cuando hayas verificado el YouTube ID.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
