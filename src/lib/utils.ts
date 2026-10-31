import type { Pelicula } from './types';

/** Convierte minutos a formato legible: 1 h 34 min */
export function formatDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Devuelve la URL de miniatura de YouTube en alta resolución con fallback */
export function ytThumb(youtubeId: string, quality: 'max' | 'hq' = 'max'): string {
  if (quality === 'max') {
    return `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** Devuelve el texto del badge de derechos */
export function derechosLabel(estado: Pelicula['derechos']): string {
  switch (estado) {
    case 'dominio_publico_ue':
      return 'Dominio público (UE)';
    case 'canal_oficial':
      return 'Canal oficial';
    case 'retenida':
      return 'Retenida';
  }
}

/** Duración ISO 8601 para JSON-LD */
export function duracionISO(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `PT${m}M`;
  if (m === 0) return `PT${h}H`;
  return `PT${h}H${m}M`;
}

/** Filtra películas publicadas que coinciden con la query */
export function buscarPeliculas(peliculas: Pelicula[], query: string): Pelicula[] {
  const q = query.toLowerCase().trim();
  if (!q) return peliculas;
  return peliculas.filter(
    (p) =>
      p.titulo.toLowerCase().includes(q) ||
      (p.titulo_original?.toLowerCase().includes(q) ?? false) ||
      p.direccion.toLowerCase().includes(q) ||
      String(p.anio).includes(q) ||
      (p.pais?.toLowerCase().includes(q) ?? false)
  );
}

/** Genera URL de embed de YouTube con nocookie */
export function ytEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
}
