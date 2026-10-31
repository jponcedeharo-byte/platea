export interface Genero {
  slug: string;
  nombre: string;
  descripcion: string;
  /** Término de búsqueda para Unsplash */
  unsplashQuery: string;
  /** Degradado CSS de reserva si Unsplash no está disponible */
  gradiente: string;
  /** Color de acento para textos sobre la imagen */
  acento: string;
}

export const GENEROS: Genero[] = [
  {
    slug: 'terror',
    nombre: 'Terror',
    descripcion: 'Sombras, monstruos y el miedo primigenio al otro lado de la puerta.',
    unsplashQuery: 'dark horror castle fog',
    gradiente: 'linear-gradient(135deg, #0a0408 0%, #2d0a14 60%, #1a0a20 100%)',
    acento: '#e87c7c',
  },
  {
    slug: 'drama',
    nombre: 'Drama',
    descripcion: 'La condición humana en toda su profundidad y contradicción.',
    unsplashQuery: 'dramatic black white portrait emotion',
    gradiente: 'linear-gradient(135deg, #0e0e10 0%, #1c1a28 60%, #0e1018 100%)',
    acento: '#a8a8c8',
  },
  {
    slug: 'comedia',
    nombre: 'Comedia',
    descripcion: 'La risa como espejo de la sociedad y sus absurdos.',
    unsplashQuery: 'vintage theater comedy stage curtain',
    gradiente: 'linear-gradient(135deg, #14100a 0%, #2a1e08 60%, #1c1408 100%)',
    acento: '#f0c060',
  },
  {
    slug: 'documental',
    nombre: 'Documental',
    descripcion: 'El mundo tal como es: sin guion, sin actores, solo la verdad.',
    unsplashQuery: 'documentary landscape nature cinematic',
    gradiente: 'linear-gradient(135deg, #080e12 0%, #0e1e28 60%, #081018 100%)',
    acento: '#70b8d8',
  },
  {
    slug: 'ciencia-ficcion',
    nombre: 'Ciencia ficción',
    descripcion: 'El futuro como laboratorio para las preguntas del presente.',
    unsplashQuery: 'science fiction space cosmos futuristic',
    gradiente: 'linear-gradient(135deg, #060818 0%, #0e1240 60%, #080820 100%)',
    acento: '#80c0ff',
  },
  {
    slug: 'aventura',
    nombre: 'Aventura',
    descripcion: 'Tierra ignota, peligro y la irresistible llamada del horizonte.',
    unsplashQuery: 'adventure exploration mountains epic',
    gradiente: 'linear-gradient(135deg, #0a1008 0%, #142814 60%, #0c1810 100%)',
    acento: '#88d888',
  },
  {
    slug: 'romance',
    nombre: 'Romance',
    descripcion: 'El amor como fuerza que lo transforma todo.',
    unsplashQuery: 'romantic vintage couple love cinematic',
    gradiente: 'linear-gradient(135deg, #140810 0%, #280e20 60%, #180810 100%)',
    acento: '#e898b8',
  },
  {
    slug: 'historico',
    nombre: 'Histórico',
    descripcion: 'Épocas pasadas reconstruidas con pasión y rigor.',
    unsplashQuery: 'ancient history ruins architecture epic',
    gradiente: 'linear-gradient(135deg, #120e06 0%, #281c08 60%, #181206 100%)',
    acento: '#d8b870',
  },
  {
    slug: 'animacion',
    nombre: 'Animación',
    descripcion: 'Cuando el dibujo cobra vida y la fantasía no tiene límites.',
    unsplashQuery: 'colorful animation art illustration',
    gradiente: 'linear-gradient(135deg, #100a18 0%, #201040 60%, #0c0820 100%)',
    acento: '#c8a0ff',
  },
  {
    slug: 'musical',
    nombre: 'Musical',
    descripcion: 'La vida expresada a través de la canción y el movimiento.',
    unsplashQuery: 'music concert stage spotlight performance',
    gradiente: 'linear-gradient(135deg, #12080a 0%, #300a20 60%, #180810 100%)',
    acento: '#ff88c0',
  },
  {
    slug: 'thriller',
    nombre: 'Thriller',
    descripcion: 'Tensión, engaño y la duda que no te deja dormir.',
    unsplashQuery: 'noir mystery shadow suspense dark',
    gradiente: 'linear-gradient(135deg, #080a10 0%, #0e1428 60%, #060810 100%)',
    acento: '#8898e0',
  },
  {
    slug: 'western',
    nombre: 'Western',
    descripcion: 'La frontera donde la ley termina y la leyenda comienza.',
    unsplashQuery: 'western desert sunset cowboys dust',
    gradiente: 'linear-gradient(135deg, #160a04 0%, #3a1804 60%, #200c04 100%)',
    acento: '#e89050',
  },
  {
    slug: 'experimental',
    nombre: 'Experimental',
    descripcion: 'El cine como arte puro, sin ataduras narrativas ni convenciones.',
    unsplashQuery: 'abstract art experimental film texture',
    gradiente: 'linear-gradient(135deg, #0a0a0a 0%, #1a1010 60%, #080c14 100%)',
    acento: '#c0c0c0',
  },
  {
    slug: 'cortos',
    nombre: 'Cortos',
    descripcion: 'La historia completa en menos de treinta minutos. La brevedad como forma.',
    unsplashQuery: 'film strip cinema short vintage reel',
    gradiente: 'linear-gradient(135deg, #0c0c0e 0%, #1a1a20 60%, #0e0e12 100%)',
    acento: '#b0c0d0',
  },
];

export function getGenero(slug: string): Genero | undefined {
  return GENEROS.find((g) => g.slug === slug);
}
