export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/* Cliente Supabase (solo servidor, usa service role)                   */
/* ------------------------------------------------------------------ */
function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan variables de entorno de Supabase.');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

/* ------------------------------------------------------------------ */
/* GET /api/admin/sugeridas                                             */
/* Devuelve hasta 50 sugerencias no descartadas, más recientes primero. */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from('sugerencias')
      .select(
        'id, youtube_id, titulo, youtube_canal_nombre, duracion_min, miniatura_url, licencia, origen, creada_en',
      )
      .eq('descartada', false)
      .order('creada_en', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[GET /api/admin/sugeridas]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sugerencias: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error inesperado.';
    console.error('[GET /api/admin/sugeridas]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/* DELETE /api/admin/sugeridas                                          */
/* Body: { id: string }                                                 */
/* Marca la sugerencia como descartada (soft delete).                   */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  let id: string;
  try {
    const body = (await req.json()) as { id?: unknown };
    if (typeof body.id !== 'string' || body.id.trim() === '') {
      return NextResponse.json({ error: 'El campo id es obligatorio.' }, { status: 400 });
    }
    id = body.id.trim();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    const { error } = await sb
      .from('sugerencias')
      .update({ descartada: true })
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/admin/sugeridas]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error inesperado.';
    console.error('[DELETE /api/admin/sugeridas]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
