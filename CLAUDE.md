# Platea — reglas para Claude Code

## Norma fundamental
- Solo vídeos legales. Platea no fomenta la piratería.
- Nunca añadas, sugieras como definitivo ni siembres películas sin `youtube_id` verificado como legal por un humano.
- No crees enlaces a búsquedas de YouTube en la web pública.
- Ningún proceso automático puede publicar películas; solo retenerlas.
- Los patrocinadores nunca se muestran dentro ni encima del reproductor de YouTube.

## Técnica
- Next.js 15 App Router + TypeScript estricto. Supabase con RLS en todas las tablas.
- Claves secretas solo en servidor. La clave de YouTube nunca llega al cliente.
- NO uses `next/font/google`: usa `@fontsource-variable` (Bodoni Moda, Schibsted Grotesk) y `@fontsource/dm-mono`.
- Usa los tokens y fuentes de PLATEA.md §4; la referencia visual es docs/prototipo.html.
- Nada de `alert/confirm/prompt`: confirmaciones dentro de la interfaz.
- Accesibilidad: foco visible ámbar, Esc cierra modales, aria-label en botones de icono, prefers-reduced-motion.
- Antes de dar una fase por terminada, comprueba sus criterios de aceptación en PLATEA.md §11.
- Supabase: fetch con `cache: "no-store"` para evitar Data Cache de Vercel.

## Idioma
- Toda la interfaz en español de España. Textos exactos en PLATEA.md §12.
