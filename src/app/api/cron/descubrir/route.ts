import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface CanalConfiable {
  id: string;
  youtube_channel_id: string;
}

interface YouTubeSearchItem {
  id: { videoId?: string; kind: string };
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { message: string; code: number };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: { duration: string };
  status: { embeddable: boolean; privacyStatus: string };
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
  error?: { message: string; code: number };
}

type Licencia = 'creativeCommons' | 'youtube';
type Origen = 'cc_search' | 'canal_confiable';

interface VideoCandidate {
  youtube_id: string;
  titulo: string;
  youtube_canal_id: string;
  youtube_canal_nombre: string;
  miniatura_url: string;
  licencia: Licencia;
  origen: Origen;
  canal_confiable_id: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convierte una duración ISO 8601 (PT1H23M45S) a minutos enteros.
 * Devuelve 0 si el formato no es reconocible.
 */
function parseISO8601Duration(iso: string): number {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

/**
 * Llama a YouTube Data API v3 y devuelve los datos parseados.
 * Si la API devuelve error, loguea y devuelve null para que el llamador lo ignore.
 */
async function youtubeSearch(
  url: string,
  contexto: string,
): Promise<YouTubeSearchResponse | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = (await res.json()) as YouTubeSearchResponse;
    if (data.error) {
      console.error(`[cron/descubrir] YouTube search error (${contexto}):`, data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[cron/descubrir] fetch error (${contexto}):`, err);
    return null;
  }
}

async function youtubeVideoDetails(
  ids: string[],
  apiKey: string,
): Promise<YouTubeVideosResponse | null> {
  if (ids.length === 0) return { items: [] };
  const url =
    `https://www.googleapis.com/youtube/v3/videos` +
    `?part=contentDetails,status&id=${ids.join(',')}&key=${apiKey}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = (await res.json()) as YouTubeVideosResponse;
    if (data.error) {
      console.error('[cron/descubrir] YouTube videos.list error:', data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[cron/descubrir] fetch error (videos.list):', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

export async function GET(req: Request): Promise<NextResponse> {
  // 1. Protección por secret
  const secret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get('x-cron-secret');
  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  // 2. Verificar YouTube API key
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY no configurada.' },
      { status: 503 },
    );
  }

  const supabase = getServiceClient();

  // 3. Obtener canales confiables activos
  const { data: canalesRaw, error: errCanales } = await supabase
    .from('canales_confiables')
    .select('id, youtube_channel_id')
    .eq('activo', true)
    .not('youtube_channel_id', 'is', null);

  if (errCanales) {
    console.error('[cron/descubrir] Error leyendo canales_confiables:', errCanales);
    return NextResponse.json({ error: 'Error leyendo canales.' }, { status: 500 });
  }

  const canales: CanalConfiable[] = (canalesRaw ?? []).slice(0, 10);

  // 4. Recopilar candidatos de canales confiables
  const candidatos: VideoCandidate[] = [];

  for (const canal of canales) {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&channelId=${encodeURIComponent(canal.youtube_channel_id)}` +
      `&type=video&order=date&videoDuration=medium&maxResults=5&key=${apiKey}`;

    const data = await youtubeSearch(url, `canal:${canal.youtube_channel_id}`);
    if (!data?.items) continue;

    for (const item of data.items) {
      const videoId = item.id.videoId ?? (item.id as unknown as string);
      if (!videoId) continue;

      const miniatura =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        '';

      candidatos.push({
        youtube_id: videoId,
        titulo: item.snippet.title,
        youtube_canal_id: item.snippet.channelId,
        youtube_canal_nombre: item.snippet.channelTitle,
        miniatura_url: miniatura,
        licencia: 'youtube',
        origen: 'canal_confiable',
        canal_confiable_id: canal.id,
      });
    }
  }

  // 5. Búsqueda global Creative Commons
  const ccUrl =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet&type=video&videoLicense=creativeCommons` +
    `&videoDuration=long&maxResults=20&relevanceLanguage=es&key=${apiKey}`;

  const ccData = await youtubeSearch(ccUrl, 'cc_global');
  if (ccData?.items) {
    for (const item of ccData.items) {
      const videoId = item.id.videoId ?? (item.id as unknown as string);
      if (!videoId) continue;

      const miniatura =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        '';

      candidatos.push({
        youtube_id: videoId,
        titulo: item.snippet.title,
        youtube_canal_id: item.snippet.channelId,
        youtube_canal_nombre: item.snippet.channelTitle,
        miniatura_url: miniatura,
        licencia: 'creativeCommons',
        origen: 'cc_search',
        canal_confiable_id: null,
      });
    }
  }

  if (candidatos.length === 0) {
    return NextResponse.json({ ok: true, nuevas_sugerencias: 0, canales_procesados: canales.length });
  }

  // 6. Deduplicar candidatos por youtube_id (puede haber solapamiento canal+CC)
  const candidatosUnicos = Array.from(
    new Map(candidatos.map((c) => [c.youtube_id, c])).values(),
  );

  // 7. Obtener detalles de YouTube (duración + embeddable + privacidad)
  //    Procesamos en lotes de 50 (límite de la API)
  const BATCH_SIZE = 50;
  const detallesMap = new Map<string, { duracion_min: number; valido: boolean }>();

  for (let i = 0; i < candidatosUnicos.length; i += BATCH_SIZE) {
    const lote = candidatosUnicos.slice(i, i + BATCH_SIZE);
    const ids = lote.map((c) => c.youtube_id);
    const resp = await youtubeVideoDetails(ids, apiKey);
    if (!resp?.items) continue;

    for (const item of resp.items) {
      const embeddable = item.status.embeddable === true;
      const esPublico = item.status.privacyStatus === 'public';
      const duracion_min = parseISO8601Duration(item.contentDetails.duration);
      detallesMap.set(item.id, { duracion_min, valido: embeddable && esPublico });
    }
  }

  // 8. Filtrar solo vídeos válidos (embeddable + public)
  const candidatosValidos = candidatosUnicos.filter((c) => {
    const detalle = detallesMap.get(c.youtube_id);
    return detalle?.valido === true;
  });

  if (candidatosValidos.length === 0) {
    return NextResponse.json({ ok: true, nuevas_sugerencias: 0, canales_procesados: canales.length });
  }

  // 9. Comprobar cuáles ya existen en `peliculas` o `sugerencias`
  const ids = candidatosValidos.map((c) => c.youtube_id);

  const [{ data: peliculasExistentes }, { data: sugerenciasExistentes }] =
    await Promise.all([
      supabase.from('peliculas').select('youtube_id').in('youtube_id', ids),
      supabase.from('sugerencias').select('youtube_id').in('youtube_id', ids),
    ]);

  const yaExistentes = new Set<string>([
    ...((peliculasExistentes ?? []).map((r: { youtube_id: string }) => r.youtube_id)),
    ...((sugerenciasExistentes ?? []).map((r: { youtube_id: string }) => r.youtube_id)),
  ]);

  const nuevos = candidatosValidos.filter((c) => !yaExistentes.has(c.youtube_id));

  if (nuevos.length === 0) {
    return NextResponse.json({ ok: true, nuevas_sugerencias: 0, canales_procesados: canales.length });
  }

  // 10. Insertar en `sugerencias`
  const filas = nuevos.map((c) => ({
    youtube_id: c.youtube_id,
    titulo: c.titulo,
    youtube_canal_id: c.youtube_canal_id,
    youtube_canal_nombre: c.youtube_canal_nombre,
    miniatura_url: c.miniatura_url,
    licencia: c.licencia,
    origen: c.origen,
    canal_confiable_id: c.canal_confiable_id,
    duracion_min: detallesMap.get(c.youtube_id)?.duracion_min ?? 0,
  }));

  const { error: errInsert } = await supabase.from('sugerencias').insert(filas);

  if (errInsert) {
    console.error('[cron/descubrir] Error insertando sugerencias:', errInsert);
    return NextResponse.json({ error: 'Error guardando sugerencias.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    nuevas_sugerencias: filas.length,
    canales_procesados: canales.length,
  });
}
