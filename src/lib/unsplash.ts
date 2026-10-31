/**
 * Obtiene una imagen de Unsplash para un término de búsqueda dado.
 * Solo se llama en el servidor (rutas de API o Server Components).
 * Si UNSPLASH_ACCESS_KEY no está configurada, devuelve null.
 * El resultado se guarda en caché 24 horas (revalidación diaria).
 */
export interface UnsplashPhoto {
  url: string;       // URL de la imagen (tamaño regular)
  blur: string;      // URL de la versión tiny para placeholder
  author: string;    // Nombre del autor
  authorUrl: string; // Perfil del autor en Unsplash
}

export async function getUnsplashPhoto(query: string): Promise<UnsplashPhoto | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 86400 }, // 24 h
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    return {
      url: data.urls?.regular ?? null,
      blur: data.urls?.thumb ?? null,
      author: data.user?.name ?? 'Unsplash',
      authorUrl: data.user?.links?.html ?? 'https://unsplash.com',
    };
  } catch {
    return null;
  }
}
