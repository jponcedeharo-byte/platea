// Fase 1: los datos provienen de los datos semilla.
// En Fase 2+ se sustituirán por llamadas a Supabase.
import { PELICULAS, COLECCIONES, PATROCINADORES } from './seed-data';
import { GENEROS } from './genres';
import type { Pelicula, Coleccion, Patrocinador } from './types';
import type { Genero } from './genres';

export function getPeliculas(): Pelicula[] {
  return PELICULAS.filter((p) => p.publicada);
}

export function getPelicula(slug: string): Pelicula | undefined {
  return PELICULAS.find((p) => p.slug === slug && p.publicada);
}

export function getColecciones(): Coleccion[] {
  return [...COLECCIONES].sort((a, b) => a.orden - b.orden);
}

export function getPatrocinadores(): Patrocinador[] {
  return PATROCINADORES.filter((p) => p.estado === 'activo');
}

export function getPeliculasPorColeccion(slug: string): Pelicula[] {
  return getPeliculas().filter((p) => p.colecciones.includes(slug));
}

export function getDestacadas(): Pelicula[] {
  return getPeliculas().filter((p) => p.destacada);
}

export function getGranEstreno(): Patrocinador | undefined {
  return getPatrocinadores().find((p) => p.nivel === 'estreno');
}

export function getPatrocinadorPorColeccion(slug: string): Patrocinador | undefined {
  return getPatrocinadores().find((p) => p.nivel === 'palco' && p.coleccion_slug === slug);
}

export function getGeneros(): Genero[] {
  return GENEROS;
}

export function getPeliculasPorGenero(slug: string): Pelicula[] {
  return getPeliculas().filter((p) => p.generos?.includes(slug));
}

export function getPatrocinadorPorGenero(slug: string): Patrocinador | undefined {
  return getPatrocinadores().find((p) => p.genero_slug === slug);
}
