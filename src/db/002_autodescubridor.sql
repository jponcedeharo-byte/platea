-- =============================================================================
-- MIGRACIÓN 002 — Sistema de Auto-descubrimiento de Películas
-- Proyecto: Platea
-- Fecha: 2026-10-31
--
-- Crea las tablas `canales_confiables` y `sugerencias`, aplica RLS
-- y siembra los canales iniciales verificados y pendientes.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLA: canales_confiables
--    Fuentes de vídeo legales cuyo contenido puede ingestarse en Platea.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.canales_confiables (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              text NOT NULL,
    -- ID interno de YouTube (formato UCxxxxxxxxxxxxxxxxxxxxxxxx).
    -- NULL mientras no esté verificado por el administrador.
    youtube_channel_id  text UNIQUE,
    -- Handle o ruta de referencia para localizar el canal manualmente,
    -- p. ej.: @kinolorber, user/nfb, c/ARTEDocumentary.
    youtube_handle      text,
    pais                text,
    tipo                text NOT NULL CHECK (tipo IN (
                            'archivo_oficial',
                            'filmoteca',
                            'distribuidor_oficial',
                            'tv_publica'
                        )),
    activo              boolean NOT NULL DEFAULT true,
    creado_en           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.canales_confiables                    IS 'Canales de YouTube cuyo contenido está pre-autorizado para sugerirse como películas en Platea.';
COMMENT ON COLUMN public.canales_confiables.youtube_channel_id IS 'ID interno de YouTube (empieza por UC). NULL = pendiente de verificar por el admin.';
COMMENT ON COLUMN public.canales_confiables.youtube_handle     IS 'Handle o ruta del canal para búsqueda manual (@handle, user/x, c/x).';
COMMENT ON COLUMN public.canales_confiables.activo             IS 'Solo se rastrean canales activos. Los pendientes de verificar se guardan con activo = false.';

-- Índice para los lookups frecuentes del autodescubridor
CREATE INDEX IF NOT EXISTS canales_confiables_activo_idx
    ON public.canales_confiables (activo);

-- RLS -------------------------------------------------------------------
ALTER TABLE public.canales_confiables ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer la lista de canales (útil para el front)
CREATE POLICY "canales_confiables_lectura_publica"
    ON public.canales_confiables
    FOR SELECT
    USING (true);

-- Solo el service_role (backend / cron) puede insertar, actualizar o borrar
CREATE POLICY "canales_confiables_escritura_service_role"
    ON public.canales_confiables
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- 2. TABLA: sugerencias
--    Vídeos candidatos detectados automáticamente, pendientes de revisión
--    por el administrador antes de publicarse en `peliculas`.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sugerencias (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ID del vídeo en YouTube (parte final de la URL watch?v=XXXXX)
    youtube_id           text UNIQUE NOT NULL,
    youtube_canal_id     text,
    youtube_canal_nombre text,
    titulo               text NOT NULL,
    duracion_min         integer,
    miniatura_url        text,
    -- Licencia declarada por YouTube: 'youtube' (estándar) o 'creativeCommons'
    licencia             text CHECK (licencia IN ('youtube', 'creativeCommons')),
    -- Cómo fue encontrado el vídeo
    origen               text NOT NULL CHECK (origen IN (
                             'cc_search',         -- búsqueda por licencia Creative Commons
                             'canal_confiable'    -- rastreo de un canal de la lista blanca
                         )),
    canal_confiable_id   uuid REFERENCES public.canales_confiables (id)
                             ON DELETE SET NULL,
    descartada           boolean NOT NULL DEFAULT false,
    creada_en            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.sugerencias                    IS 'Vídeos candidatos detectados por el autodescubridor. Deben revisarse antes de publicarse en `peliculas`.';
COMMENT ON COLUMN public.sugerencias.youtube_id         IS 'ID del vídeo en YouTube (11 caracteres, p. ej. dQw4w9WgXcQ).';
COMMENT ON COLUMN public.sugerencias.licencia           IS 'Licencia declarada en la API de YouTube: youtube (estándar) o creativeCommons.';
COMMENT ON COLUMN public.sugerencias.origen             IS 'cc_search = encontrado por búsqueda CC; canal_confiable = rastreado desde la lista blanca.';
COMMENT ON COLUMN public.sugerencias.descartada         IS 'true = el admin la ha rechazado; no se vuelve a sugerir.';

-- Índices para los flujos más habituales
CREATE INDEX IF NOT EXISTS sugerencias_descartada_idx
    ON public.sugerencias (descartada);

CREATE INDEX IF NOT EXISTS sugerencias_canal_confiable_id_idx
    ON public.sugerencias (canal_confiable_id);

CREATE INDEX IF NOT EXISTS sugerencias_creada_en_idx
    ON public.sugerencias (creada_en DESC);

-- RLS -------------------------------------------------------------------
ALTER TABLE public.sugerencias ENABLE ROW LEVEL SECURITY;

-- Solo el service_role puede insertar (el cron / backend escribe aquí)
CREATE POLICY "sugerencias_insercion_service_role"
    ON public.sugerencias
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Los admins (identificados por el claim app_metadata->>'role') pueden leer
CREATE POLICY "sugerencias_lectura_admin"
    ON public.sugerencias
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Los admins pueden actualizar (p. ej. marcar descartada = true)
CREATE POLICY "sugerencias_actualizacion_admin"
    ON public.sugerencias
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- El service_role también necesita actualizar (p. ej. enriquecer metadatos)
CREATE POLICY "sugerencias_actualizacion_service_role"
    ON public.sugerencias
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ---------------------------------------------------------------------------
-- 3. SEMILLA: canales_confiables
--    Orden: primero los verificados (activo = true), luego los pendientes.
-- ---------------------------------------------------------------------------

-- ·· Canales verificados (youtube_channel_id confirmado) ··················

INSERT INTO public.canales_confiables
    (nombre, youtube_channel_id, youtube_handle, pais, tipo, activo)
VALUES
    ('Internet Archive',
     'UCFa_X02QhJnP0FNpFAKyRRg', NULL,
     'EE.UU.', 'archivo_oficial', true),

    ('DW Documentary',
     'UCW39zufHfsuGgpLviKh297Q', NULL,
     'Alemania', 'tv_publica', true),

    ('Silent Film Archives',
     'UCCBrKyMWN7Zu6iVNlmu9Q7A', NULL,
     'EE.UU.', 'archivo_oficial', true),

    ('Timeless Classic Movies',
     'UCOg0aMAXmF3o5m243PxhE5g', NULL,
     'EE.UU.', 'archivo_oficial', true),

    ('Deutsche Kinemathek',
     'UCkGtP5D-JDMNfHPIB5thEoQ', NULL,
     'Alemania', 'archivo_oficial', true)

ON CONFLICT (youtube_channel_id) DO NOTHING;

-- ·· Canales pendientes de verificar (activo = false, youtube_channel_id NULL) ··

INSERT INTO public.canales_confiables
    (nombre, youtube_channel_id, youtube_handle, pais, tipo, activo)
VALUES
    ('Mosfilm English',
     NULL, '@Mosfilm_eng',
     'Rusia', 'archivo_oficial', false),

    ('NFB Canada',
     NULL, 'user/nfb',
     'Canadá', 'archivo_oficial', false),

    ('EYE Filmmuseum',
     NULL, 'user/eyefilmNL',
     'Países Bajos', 'archivo_oficial', false),

    ('Library of Congress',
     NULL, 'c/loc',
     'EE.UU.', 'archivo_oficial', false),

    ('Filmoteca UNAM',
     NULL, 'user/FilmotecaUNAM',
     'México', 'filmoteca', false),

    ('Acervo Fílmico A.C.',
     NULL, '@AcervoFilmico',
     'México', 'filmoteca', false),

    ('Mercury Films',
     NULL, '@MERCURYFILMS',
     'España', 'distribuidor_oficial', false),

    ('Kino Lorber',
     NULL, '@kinolorber',
     'EE.UU.', 'distribuidor_oficial', false),

    ('Canal Encuentro',
     NULL, 'user/encuentro',
     'Argentina', 'tv_publica', false),

    ('Cineteca Nacional MX',
     NULL, 'CinetecaNacionalMX',
     'México', 'filmoteca', false),

    ('FPA Classics (Lobster)',
     NULL, '@FPACLASSICS',
     'Francia', 'archivo_oficial', false),

    ('ARTE Documentary',
     NULL, 'c/ARTEDocumentary',
     'Francia/Alemania', 'tv_publica', false)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- FIN DE LA MIGRACIÓN 002
-- =============================================================================
