export type DerechosEstado = 'dominio_publico_ue' | 'canal_oficial' | 'retenida';
export type NivelPatrocinio = 'butaca' | 'palco' | 'estreno';

export interface Coleccion {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  orden: number;
}

export interface Pelicula {
  id: string;
  slug: string;
  titulo: string;
  titulo_original?: string;
  anio: number;
  direccion: string;
  duracion_min: number;
  episodios?: number;
  sinopsis: string;
  pais?: string;
  idioma?: string;
  subtitulos_es?: boolean;
  youtube_id?: string;
  youtube_canal_nombre?: string;
  imagen_url?: string;
  motif: string;
  paleta: string[];
  derechos: DerechosEstado;
  derechos_justificacion?: string;
  destacada?: boolean;
  publicada: boolean;
  colecciones: string[];
  generos?: string[];
}

export interface Patrocinador {
  id: string;
  nombre_publico: string;
  enlace_web?: string;
  nivel: NivelPatrocinio;
  coleccion_slug?: string;
  genero_slug?: string;
  estado: 'activo';
}
