import { NextResponse } from 'next/server';

// Solo servidor. La clave de TMDB nunca llega al cliente.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Consulta demasiado corta.' }, { status: 400 });
  }

  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey) {
    return NextResponse.json(
      { error: 'TMDB no configurado. Añade TMDB_API_KEY a .env.local.' },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&language=es-ES&include_adult=false`,
      {
        headers: { Authorization: `Bearer ${tmdbKey}` },
        next: { revalidate: 0 },
      },
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Error consultando TMDB.' }, { status: 502 });
    }
    const data = await res.json();

    // Devolver solo los campos que necesitamos
    const results = (data.results ?? []).slice(0, 10).map((m: {
      id: number;
      title: string;
      original_title: string;
      release_date: string;
      overview: string;
      origin_country?: string[];
      original_language: string;
      runtime?: number;
      poster_path: string | null;
    }) => ({
      tmdb_id: m.id,
      titulo: m.title,
      titulo_original: m.original_title,
      anio: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
      sinopsis: m.overview,
      pais: (m.origin_country ?? []).join(', '),
      idioma: m.original_language,
      duracion_min: m.runtime ?? null,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[admin/buscar]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
