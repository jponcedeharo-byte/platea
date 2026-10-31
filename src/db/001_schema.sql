-- Platea — Migración 001: Esquema inicial
-- Ejecutar en el SQL Editor de Supabase

-- ── Tipos enumerados ─────────────────────────────────────────────────────────
create type derechos_estado as enum ('dominio_publico_ue', 'canal_oficial', 'retenida');
create type nivel_patrocinio as enum ('butaca', 'palco', 'estreno');
create type estado_patrocinio as enum ('pendiente_pago', 'activo', 'impago', 'cancelado');

-- ── Colecciones ───────────────────────────────────────────────────────────────
create table colecciones (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text,
  orden int not null default 0,
  creada_en timestamptz default now()
);

-- ── Películas ─────────────────────────────────────────────────────────────────
create table peliculas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  titulo_original text,
  anio int not null check (anio between 1888 and 2100),
  direccion text not null,
  duracion_min int not null check (duracion_min > 0),
  episodios int,
  sinopsis text not null,
  pais text,
  idioma text,
  subtitulos_es boolean default false,
  youtube_id text not null unique,
  youtube_canal_id text,
  youtube_canal_nombre text not null,
  youtube_licencia text,
  imagen_url text,
  motif text not null default 'sombra',
  paleta text[],
  derechos derechos_estado not null,
  derechos_justificacion text not null,
  legal_confirmado_por uuid references auth.users(id),
  legal_confirmado_en timestamptz not null default now(),
  destacada boolean default false,
  publicada boolean generated always as (derechos <> 'retenida') stored,
  ultima_verificacion timestamptz,
  creada_en timestamptz default now(),
  actualizada_en timestamptz default now()
);

-- ── Relación película-colección ───────────────────────────────────────────────
create table pelicula_coleccion (
  pelicula_id uuid references peliculas(id) on delete cascade,
  coleccion_id uuid references colecciones(id) on delete cascade,
  orden int default 0,
  primary key (pelicula_id, coleccion_id)
);

-- ── Patrocinadores ────────────────────────────────────────────────────────────
create table patrocinadores (
  id uuid primary key default gen_random_uuid(),
  nombre_publico text not null,
  enlace_web text,
  email_contacto text not null,
  nivel nivel_patrocinio not null,
  coleccion_id uuid references colecciones(id),
  estado estado_patrocinio not null default 'pendiente_pago',
  stripe_customer_id text,
  stripe_subscription_id text,
  desde date,
  creada_en timestamptz default now()
);

-- Solo un Gran estreno activo y un Palco activo por colección
create unique index un_estreno_activo
  on patrocinadores ((nivel))
  where nivel = 'estreno' and estado = 'activo';

create unique index un_palco_por_coleccion
  on patrocinadores (coleccion_id)
  where nivel = 'palco' and estado = 'activo';

-- ── Solicitudes de patrocinio ─────────────────────────────────────────────────
create table solicitudes_patrocinio (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  email text not null,
  nivel nivel_patrocinio not null,
  mensaje text,
  atendida boolean default false,
  creada_en timestamptz default now()
);

-- ── Avisos de derechos ────────────────────────────────────────────────────────
create table avisos_derechos (
  id uuid primary key default gen_random_uuid(),
  pelicula_id uuid references peliculas(id) on delete cascade,
  motivo text not null,
  email text,
  estado text not null default 'abierto',
  derechos_previos derechos_estado,
  creado_en timestamptz default now(),
  resuelto_en timestamptz
);

-- ── Admins ────────────────────────────────────────────────────────────────────
create table admins (
  user_id uuid primary key references auth.users(id),
  email text not null
);

-- ── Vista pública de patrocinadores ──────────────────────────────────────────
create view patrocinadores_publicos as
  select id, nombre_publico, enlace_web, nivel, coleccion_id
  from patrocinadores
  where estado = 'activo';

-- ── Trigger: aviso de derechos oculta la película de inmediato ───────────────
create or replace function fn_aviso_retiene_pelicula()
returns trigger language plpgsql security definer as $$
begin
  -- Guardar el estado previo de derechos
  update peliculas
  set derechos_previos_tmp = derechos
  where id = new.pelicula_id;

  -- Retener la película
  update peliculas
  set derechos = 'retenida'
  where id = new.pelicula_id;

  -- Guardar derechos_previos en el aviso
  new.derechos_previos := (select derechos from peliculas where id = new.pelicula_id);
  return new;
end;
$$;

-- Nota: el campo derechos_previos_tmp no existe; el trigger guarda el estado
-- antes de actualizar usando una subselect. Versión corregida:
create or replace function fn_aviso_retiene_pelicula()
returns trigger language plpgsql security definer as $$
declare
  prev derechos_estado;
begin
  select derechos into prev from peliculas where id = new.pelicula_id;
  new.derechos_previos := prev;
  update peliculas set derechos = 'retenida' where id = new.pelicula_id;
  return new;
end;
$$;

create trigger trg_aviso_retiene
  before insert on avisos_derechos
  for each row execute function fn_aviso_retiene_pelicula();

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table peliculas enable row level security;
alter table colecciones enable row level security;
alter table pelicula_coleccion enable row level security;
alter table patrocinadores enable row level security;
alter table avisos_derechos enable row level security;
alter table solicitudes_patrocinio enable row level security;

-- Películas: lectura pública solo de publicadas
create policy "peliculas_lectura_publica"
  on peliculas for select
  using (publicada = true);

-- Colecciones: lectura pública
create policy "colecciones_lectura_publica"
  on colecciones for select
  using (true);

-- Relación película-colección: lectura pública
create policy "pelicula_coleccion_lectura_publica"
  on pelicula_coleccion for select
  using (true);

-- Avisos: inserción pública (cualquiera puede avisar)
create policy "avisos_insercion_publica"
  on avisos_derechos for insert
  with check (
    length(motivo) between 10 and 1000
    and (email is null or length(email) < 200)
  );

-- Solicitudes: inserción pública
create policy "solicitudes_insercion_publica"
  on solicitudes_patrocinio for insert
  with check (
    length(empresa) between 2 and 200
    and length(email) between 5 and 200
  );

-- Patrocinadores: solo se lee la vista pública (sin RLS en la vista, sí en la tabla)
create policy "patrocinadores_sin_acceso_directo"
  on patrocinadores for select
  using (false);

-- ── Semilla de colecciones ────────────────────────────────────────────────────
insert into colecciones (slug, nombre, descripcion, orden) values
  ('murnau',   'Murnau, el maestro',      'La obra del cineasta alemán F. W. Murnau, uno de los pilares del expresionismo.', 1),
  ('terror',   'Terror de los orígenes',  'Los primeros grandes terrores del cine silente.', 2),
  ('truco',    'Pioneros del truco',       'Méliès, Chomón y Porter: los magos que inventaron el lenguaje cinematográfico.', 3),
  ('mundo',    'Mirar el mundo',           'El documental como arte: observar, registrar y revelar.', 4),
  ('epopeya',  'Grandes epopeyas',         'Ambición sin límite: películas que lo apostaron todo a la escala.', 5);
